"""
RAG Service - Retrieval Augmented Generation for Compliance Checking
Uses ChromaDB + sentence-transformers for semantic search of state laws
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

try:
    import chromadb
    from chromadb.config import Settings
    from sentence_transformers import SentenceTransformer
    DEPENDENCIES_AVAILABLE = True
except ImportError as e:
    DEPENDENCIES_AVAILABLE = False
    logging.warning(f"RAG dependencies not available: {e}")

logger = logging.getLogger(__name__)


class RAGService:
    """
    Retrieval Augmented Generation service for state law lookup
    """

    def __init__(self,
                 data_path: str = None,
                 embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
                 chroma_persist_dir: str = None):
        """
        Initialize RAG service

        Args:
            data_path: Path to state laws JSON files
            embedding_model: Sentence transformer model name
            chroma_persist_dir: Directory to persist ChromaDB
        """
        if not DEPENDENCIES_AVAILABLE:
            raise ImportError("RAG dependencies not installed. Run: pip install -r requirements_v2.txt")

        # Set up paths
        self.base_dir = Path(__file__).parent.parent
        self.data_path = Path(data_path) if data_path else self.base_dir / "data" / "state_laws_20"
        self.chroma_persist_dir = chroma_persist_dir or str(self.base_dir / "vector_store")

        # Create directories
        self.data_path.mkdir(parents=True, exist_ok=True)
        Path(self.chroma_persist_dir).mkdir(parents=True, exist_ok=True)

        # Initialize embedding model
        logger.info(f"Loading embedding model: {embedding_model}")
        self.embedding_model = SentenceTransformer(embedding_model)
        logger.info(f"✅ Embedding model loaded: {embedding_model}")

        # Initialize ChromaDB with persistence
        logger.info(f"Initializing ChromaDB at: {self.chroma_persist_dir}")
        self.chroma_client = chromadb.PersistentClient(
            path=self.chroma_persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )

        # Get or create collection
        self.collection_name = "state_compliance_laws"
        try:
            self.collection = self.chroma_client.get_collection(name=self.collection_name)
            logger.info(f"✅ Loaded existing collection: {self.collection_name}")
        except Exception:
            self.collection = self.chroma_client.create_collection(
                name=self.collection_name,
                metadata={"description": "US State Employment Laws for Compliance Checking"}
            )
            logger.info(f"✅ Created new collection: {self.collection_name}")

        # Track loaded states
        self.loaded_states = set()
        self._check_loaded_states()

    def _check_loaded_states(self):
        """Check which states are already loaded in the vector DB"""
        try:
            # Query all documents to see which states we have
            results = self.collection.get()
            if results and results.get('metadatas'):
                states = set(meta.get('state') for meta in results['metadatas'] if meta.get('state'))
                self.loaded_states = states
                logger.info(f"📚 Loaded states in vector DB: {sorted(self.loaded_states)}")
        except Exception as e:
            logger.warning(f"Could not check loaded states: {e}")

    def load_state_laws(self, state_code: str, force_reload: bool = False):
        """
        Load laws for a specific state into vector database

        Args:
            state_code: Two-letter state code (e.g., "CA")
            force_reload: Force reload even if already loaded
        """
        if state_code in self.loaded_states and not force_reload:
            logger.info(f"State {state_code} already loaded, skipping")
            return

        # Load JSON file
        json_path = self.data_path / f"{state_code}.json"

        if not json_path.exists():
            logger.warning(f"No data file found for state {state_code} at {json_path}")
            return

        with open(json_path, 'r', encoding='utf-8') as f:
            state_data = json.load(f)

        laws = state_data.get('laws', [])

        if not laws:
            logger.warning(f"No laws found in {json_path}")
            return

        # Extract actual state code from JSON (more reliable than filename)
        actual_state_code = state_data.get('state_code', state_code)
        if not actual_state_code:
            # Fallback: use state_code parameter but log warning
            actual_state_code = state_code
            logger.warning(f"No state_code in JSON, using filename-based code: {state_code}")
        else:
            logger.info(f"Using state code from JSON: {actual_state_code}")

        # Prepare documents for embedding
        documents = []
        metadatas = []
        ids = []

        for idx, law in enumerate(laws):
            # Create rich text for embedding (combines multiple fields)
            doc_text = f"""
Topic: {law.get('topic', 'Unknown')}
Summary: {law.get('summary', '')}
Law Citation: {law.get('law_citation', '')}
Details: {law.get('full_text', law.get('summary', ''))}
            """.strip()

            documents.append(doc_text)

            # Metadata for filtering and retrieval
            metadatas.append({
                'state': actual_state_code,
                'topic': law.get('topic', 'unknown'),
                'law_citation': law.get('law_citation', ''),
                'severity': law.get('severity', 'warning'),
                'source_url': law.get('source_url', ''),
                'effective_date': law.get('effective_date', ''),
                'summary': law.get('summary', '')[:500]  # Truncate for metadata
            })

            ids.append(f"{actual_state_code}_{law.get('topic', 'unknown')}_{idx}")

        # Generate embeddings
        logger.info(f"Generating embeddings for {len(documents)} laws from {actual_state_code}...")
        embeddings = self.embedding_model.encode(documents, show_progress_bar=True)

        # Add to ChromaDB
        self.collection.add(
            documents=documents,
            embeddings=embeddings.tolist(),
            metadatas=metadatas,
            ids=ids
        )

        self.loaded_states.add(actual_state_code)
        logger.info(f"✅ Loaded {len(documents)} laws for {actual_state_code} into vector DB")

    def load_all_states(self, force_reload: bool = False):
        """Load all available state laws from data directory"""
        json_files = list(self.data_path.glob("*.json"))

        if not json_files:
            logger.warning(f"No state law files found in {self.data_path}")
            return

        logger.info(f"Found {len(json_files)} state law files")

        for json_file in json_files:
            state_code = json_file.stem  # Filename without extension
            if state_code == "metadata":
                continue

            try:
                self.load_state_laws(state_code, force_reload=force_reload)
            except Exception as e:
                logger.error(f"Failed to load {state_code}: {e}")

    def query_relevant_laws(self,
                           state: str,
                           document_text: str,
                           top_k: int = 10,
                           min_similarity: float = 0.15,
                           use_keyword_boost: bool = True) -> List[Dict[str, Any]]:
        """
        Retrieve relevant state laws for compliance checking using hybrid search

        Args:
            state: Two-letter state code (e.g., "CA")
            document_text: Offer letter text to analyze
            top_k: Number of relevant laws to retrieve
            min_similarity: Minimum similarity threshold (0-1, default 0.15)
                          Lower threshold (0.1) = more matches, less precise
                          Higher threshold (0.3) = fewer matches, more precise
            use_keyword_boost: Boost similarity scores for keyword matches

        Returns:
            List of relevant laws with metadata and similarity scores
        """
        if state not in self.loaded_states:
            logger.warning(f"State {state} not loaded in vector DB")
            return []

        # Extract keywords from query for boosting
        keywords = self._extract_keywords(document_text.lower()) if use_keyword_boost else []

        # Generate query embedding
        query_embedding = self.embedding_model.encode([document_text])[0]

        # Query ChromaDB - get more results for hybrid filtering
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=min(top_k * 3, 20),  # Get extra results for filtering
            where={"state": state}
        )

        # Format results with hybrid scoring
        relevant_laws = []
        all_similarities = []  # Track all similarities for debugging

        if results and results.get('documents'):
            for idx in range(len(results['documents'][0])):
                # Calculate similarity score (ChromaDB returns cosine distance 0-2)
                # distance: 0=identical, 1=orthogonal, 2=opposite
                distance = results['distances'][0][idx] if results.get('distances') else 1.0

                # Convert distance to similarity (0-1 range, higher is better)
                # Use formula: similarity = max(0, 1 - distance)
                # This handles distances > 1.0 gracefully
                base_similarity = max(0.0, 1.0 - distance)

                # Apply keyword boosting for hybrid search
                metadata = results['metadatas'][0][idx]
                keyword_boost = self._calculate_keyword_boost(
                    keywords,
                    metadata.get('topic', ''),
                    metadata.get('summary', ''),
                    results['documents'][0][idx]
                ) if use_keyword_boost else 0.0

                # Combine semantic similarity with keyword boost
                # Final score = 70% semantic + 30% keyword match
                final_similarity = base_similarity * 0.7 + keyword_boost * 0.3
                all_similarities.append((base_similarity, keyword_boost, final_similarity))

                if final_similarity < min_similarity:
                    logger.debug(f"Skipping law with similarity {final_similarity:.3f} < {min_similarity}")
                    continue

                law = {
                    'document': results['documents'][0][idx],
                    'metadata': metadata,
                    'similarity': final_similarity,
                    'base_similarity': base_similarity,
                    'keyword_boost': keyword_boost,
                    'id': results['ids'][0][idx]
                }
                relevant_laws.append(law)

        # Sort by final similarity (descending) and limit to top_k
        relevant_laws.sort(key=lambda x: x['similarity'], reverse=True)
        relevant_laws = relevant_laws[:top_k]

        # Improved logging with hybrid scores
        if all_similarities:
            final_sims = [s[2] for s in all_similarities]
            max_sim = max(final_sims) if final_sims else 0
            min_sim = min(final_sims) if final_sims else 0
            logger.info(f"Found {len(relevant_laws)} relevant laws for {state} (threshold: {min_similarity})")
            logger.info(f"  Final similarity range: {min_sim:.3f} to {max_sim:.3f}")
            if use_keyword_boost and keywords:
                logger.info(f"  Keyword boosting enabled with {len(keywords)} keywords")
            if len(relevant_laws) == 0 and all_similarities:
                logger.warning(f"  All {len(all_similarities)} laws below threshold! Consider lowering threshold.")
        else:
            logger.warning(f"No laws found in vector DB for {state}")

        return relevant_laws

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract employment law keywords from text"""
        # Common employment law keywords and phrases
        keyword_patterns = [
            'non-compete', 'non compete', 'noncompete',
            'salary history', 'wage history', 'compensation history',
            'background check', 'criminal history', 'criminal record',
            'drug test', 'drug screen', 'marijuana', 'cannabis',
            'arbitration', 'mandatory arbitration',
            'at-will', 'at will employment',
            'pay transparency', 'salary range', 'pay scale',
            'paid leave', 'sick leave', 'family leave',
            'severance', 'termination',
            'trade secret', 'confidential', 'proprietary',
            'overtime', 'exempt', 'non-exempt',
            'classification', 'independent contractor',
            'discrimination', 'harassment', 'retaliation'
        ]

        found_keywords = []
        text_lower = text.lower()

        for keyword in keyword_patterns:
            if keyword in text_lower:
                found_keywords.append(keyword.replace(' ', '_'))

        return found_keywords

    def _calculate_keyword_boost(self, keywords: List[str], topic: str,
                                 summary: str, document: str) -> float:
        """Calculate keyword matching boost score (0-1)"""
        if not keywords:
            return 0.0

        matches = 0
        max_matches = len(keywords)

        # Combine all searchable text
        searchable = f"{topic} {summary} {document}".lower()

        for keyword in keywords:
            # Check for keyword match (handles underscores and spaces)
            keyword_variants = [
                keyword.replace('_', ' '),
                keyword.replace('_', '-'),
                keyword.replace('_', '')
            ]

            for variant in keyword_variants:
                if variant in searchable:
                    matches += 1
                    break  # Count each keyword only once

        # Return boost score (0-1)
        return matches / max_matches if max_matches > 0 else 0.0

    def get_state_coverage(self) -> Dict[str, Any]:
        """Get information about which states are loaded"""
        total_docs = self.collection.count()

        return {
            "total_laws": total_docs,
            "states_loaded": sorted(list(self.loaded_states)),
            "state_count": len(self.loaded_states)
        }

    def clear_database(self):
        """Clear all data from vector database (use with caution!)"""
        logger.warning("Clearing entire vector database...")
        self.chroma_client.delete_collection(name=self.collection_name)
        self.collection = self.chroma_client.create_collection(
            name=self.collection_name,
            metadata={"description": "US State Employment Laws for Compliance Checking"}
        )
        self.loaded_states = set()
        logger.info("✅ Vector database cleared")


# Singleton instance
_rag_service_instance = None

def get_rag_service() -> RAGService:
    """Get singleton RAG service instance"""
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = RAGService()
    return _rag_service_instance


# Test function
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing RAG Service...")

    # Initialize service
    rag = RAGService()

    # Check coverage
    coverage = rag.get_state_coverage()
    print(f"\nCurrent coverage: {coverage}")

    # Test query (if any states are loaded)
    if coverage['states_loaded']:
        test_state = coverage['states_loaded'][0]
        test_text = "This offer letter includes a non-compete clause"

        results = rag.query_relevant_laws(test_state, test_text, top_k=3)
        print(f"\nTest query for {test_state}:")
        for idx, law in enumerate(results, 1):
            print(f"\n{idx}. {law['metadata']['topic']} (similarity: {law['similarity']:.2f})")
            print(f"   Citation: {law['metadata']['law_citation']}")
            print(f"   Summary: {law['metadata']['summary'][:100]}...")
