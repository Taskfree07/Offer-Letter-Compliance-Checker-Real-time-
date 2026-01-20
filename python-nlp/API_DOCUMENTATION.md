# Compliance Checker API Documentation

**Version**: 2.0
**Base URL**: `http://localhost:5000/api/v2`
**Production URL**: `https://your-domain.com/api/v2`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Example Workflows](#example-workflows)
7. [SDKs and Code Examples](#sdks-and-code-examples)

---

## Overview

The Compliance Checker API provides automated analysis of employment offer letters against state-specific labor laws. It uses a multi-layer validation system combining pattern matching, semantic search (RAG), and optional LLM analysis.

### Key Features

- ✅ **14 States Supported**: AZ, CA, CO, FL, IL, MA, MI, NC, NJ, NY, OR, TX, VA, WA
- ✅ **98 Laws Database**: Comprehensive coverage of employment law topics
- ✅ **Multi-Layer Validation**: Pattern matching + RAG + Cross-validation
- ✅ **Confidence Scoring**: Each violation includes confidence score (0.0-1.0)
- ✅ **Hybrid Search**: 70% semantic + 30% keyword matching
- ✅ **Fast Responses**: 0.12s - 2.74s average processing time

### Supported Topics

- Non-compete agreements
- Salary history inquiries
- Background checks
- Drug screening (including marijuana)
- Arbitration clauses
- Pay transparency
- At-will employment
- Paid leave (where applicable)

---

## Authentication

### Current Version (Development)

No authentication required. All endpoints are publicly accessible.

### Production Version (Recommended)

For production deployment, implement one of:

1. **API Key Authentication**
   ```
   Authorization: Bearer YOUR_API_KEY
   ```

2. **OAuth 2.0**
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

3. **JWT Tokens**
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

---

## Endpoints

### 1. Health Check

**GET** `/api/v2/health`

Check API health and service status.

#### Request

```bash
curl http://localhost:5000/api/v2/health
```

#### Response

```json
{
  "status": "healthy",
  "version": "2.0",
  "services": {
    "rag": "operational",
    "llm": "operational",
    "analyzer": "operational"
  },
  "database": {
    "total_laws": 98,
    "states_loaded": 14
  }
}
```

#### Status Codes

- `200 OK` - Service is healthy
- `500 Internal Server Error` - Service is unhealthy

---

### 2. Get Supported States

**GET** `/api/v2/states`

Retrieve list of supported states and their coverage details.

#### Request

```bash
curl http://localhost:5000/api/v2/states
```

#### Response

```json
{
  "total_states": 14,
  "states": ["AZ", "CA", "CO", "FL", "IL", "MA", "MI", "NC", "NJ", "NY", "OR", "TX", "VA", "WA"],
  "total_laws": 98,
  "state_details": {
    "CA": {
      "total_laws": 7,
      "topics_covered": [
        "arbitration",
        "at_will_employment",
        "background_checks",
        "drug_screening",
        "non_compete",
        "pay_transparency",
        "salary_history"
      ]
    },
    "...": "..."
  },
  "coverage_notes": "Production-ready data with 95-99% accuracy"
}
```

#### Status Codes

- `200 OK` - Successfully retrieved states
- `500 Internal Server Error` - Database error

---

### 3. Compliance Check

**POST** `/api/v2/compliance-check`

Perform full compliance analysis on an offer letter.

#### Request

```bash
curl -X POST http://localhost:5000/api/v2/compliance-check \
  -H "Content-Type: application/json" \
  -d '{
    "document_text": "EMPLOYMENT OFFER LETTER\n\nWe are pleased to offer you the position of Senior Software Engineer.\n\n1. NON-COMPETE AGREEMENT\nYou agree that for a period of 2 years after employment ends, you will not work for any competing business.\n\n2. BACKGROUND CHECK\nWe will conduct a criminal background check before your start date.\n\n3. COMPENSATION\nBased on your previous salary at your last employer of $120,000, we are offering you an annual salary of $130,000.",
    "state": "CA",
    "options": {
      "min_confidence": 0.3
    }
  }'
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_text` | string | Yes | Full text of the offer letter (min 50 characters) |
| `state` | string | Yes | Two-letter state code (e.g., "CA", "NY") |
| `options` | object | No | Analysis options |
| `options.min_confidence` | number | No | Minimum confidence threshold (0.0-1.0, default: 0.0) |

#### Response

```json
{
  "state": "CA",
  "document_length": 458,
  "total_violations": 2,
  "errors": 2,
  "warnings": 0,
  "info": 0,
  "confidence_avg": 0.75,
  "violations": [
    {
      "topic": "Salary History Inquiry",
      "severity": "error",
      "confidence": 0.95,
      "message": "California law prohibits employers from asking about salary history (California Labor Code Section 432.3)",
      "law_citation": "California Labor Code Section 432.3",
      "validation_method": "pattern_rag_llm",
      "source_url": "https://leginfo.legislature.ca.gov/..."
    },
    {
      "topic": "Non-Compete Restrictions",
      "severity": "error",
      "confidence": 0.55,
      "message": "Non-compete clauses are void and unenforceable in California (Business & Professions Code Section 16600)",
      "law_citation": "California Business & Professions Code Section 16600",
      "validation_method": "pattern_matching",
      "source_url": "https://leginfo.legislature.ca.gov/..."
    }
  ],
  "summary": {
    "is_compliant": false,
    "critical_issues": 2,
    "warnings": 0,
    "info_items": 0,
    "overall_risk": "HIGH"
  },
  "_performance": {
    "processing_time_seconds": 0.71,
    "timestamp": 1736813025.123
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `state` | string | State code analyzed |
| `document_length` | number | Character count of document |
| `total_violations` | number | Total number of violations found |
| `errors` | number | Count of critical violations |
| `warnings` | number | Count of warnings |
| `info` | number | Count of informational items |
| `confidence_avg` | number | Average confidence across all violations (0.0-1.0) |
| `violations` | array | List of violation objects |
| `summary` | object | Summary of compliance status |
| `_performance` | object | Performance metrics |

#### Violation Object

| Field | Type | Description |
|-------|------|-------------|
| `topic` | string | Topic of the violation |
| `severity` | string | Severity level: "error", "warning", "info" |
| `confidence` | number | Confidence score (0.0-1.0) |
| `message` | string | Detailed explanation of the violation |
| `law_citation` | string | Legal citation (statute or code) |
| `validation_method` | string | Method used: "pattern_matching", "rag_llm", "pattern_rag_llm" |
| `source_url` | string | URL to official law source (optional) |

#### Status Codes

- `200 OK` - Analysis completed successfully
- `400 Bad Request` - Invalid input (missing state, invalid state code, document too short)
- `500 Internal Server Error` - Analysis failed

---

### 4. Analyze Laws

**POST** `/api/v2/analyze-laws`

Query relevant laws for a document without full compliance analysis.

#### Request

```bash
curl -X POST http://localhost:5000/api/v2/analyze-laws \
  -H "Content-Type: application/json" \
  -d '{
    "document_text": "non-compete clause for 2 years and salary history inquiry",
    "state": "CA",
    "top_k": 5,
    "min_similarity": 0.15
  }'
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_text` | string | Yes | Text to analyze |
| `state` | string | Yes | Two-letter state code |
| `top_k` | number | No | Number of laws to return (default: 5) |
| `min_similarity` | number | No | Minimum similarity threshold (0.0-1.0, default: 0.15) |

#### Response

```json
{
  "state": "CA",
  "total_laws_found": 2,
  "query_length": 59,
  "laws": [
    {
      "topic": "salary_history",
      "summary": "Employers are prohibited from asking applicants about their salary history...",
      "law_citation": "California Labor Code Section 432.3",
      "severity": "error",
      "similarity_score": 0.182,
      "base_similarity": 0.130,
      "keyword_boost": 0.750,
      "source_url": "https://leginfo.legislature.ca.gov/...",
      "effective_date": "January 1, 2018"
    },
    {
      "topic": "non_compete",
      "summary": "Non-compete clauses are VOID and unenforceable in California...",
      "law_citation": "California Business & Professions Code Section 16600",
      "severity": "error",
      "similarity_score": 0.150,
      "base_similarity": 0.105,
      "keyword_boost": 0.650,
      "source_url": "https://leginfo.legislature.ca.gov/...",
      "effective_date": "1872 (original); Amended 2023"
    }
  ]
}
```

#### Status Codes

- `200 OK` - Query completed successfully
- `400 Bad Request` - Invalid input (missing parameters, unsupported state)
- `500 Internal Server Error` - Query failed

---

### 5. Validate Document

**POST** `/api/v2/validate-document`

Quick validation of document format and completeness.

#### Request

```bash
curl -X POST http://localhost:5000/api/v2/validate-document \
  -H "Content-Type: application/json" \
  -d '{
    "document_text": "EMPLOYMENT OFFER\n\nPosition: Senior Software Engineer\nSalary: $140,000 per year\nStart Date: May 1, 2025\n\nBenefits: Health, dental, vision\nAt-will employment relationship"
  }'
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_text` | string | Yes | Document text to validate |

#### Response

```json
{
  "is_valid": true,
  "issues": [],
  "document_length": 178,
  "word_count": 26,
  "found_sections": [
    "position",
    "salary",
    "start date",
    "benefits",
    "employment"
  ],
  "completeness_score": 100
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `is_valid` | boolean | Whether document passes basic validation |
| `issues` | array | List of validation issues (e.g., "Document is very short") |
| `document_length` | number | Character count |
| `word_count` | number | Word count |
| `found_sections` | array | List of detected sections |
| `completeness_score` | number | Completeness score (0-100) |

#### Status Codes

- `200 OK` - Validation completed
- `500 Internal Server Error` - Validation failed

---

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "error": "Error category",
  "message": "Detailed error message"
}
```

### Common Error Responses

#### 400 Bad Request - Missing State

```json
{
  "error": "Missing required field: state",
  "message": "State code is required (e.g., CA, NY, TX)"
}
```

#### 400 Bad Request - Invalid State Code

```json
{
  "error": "Invalid state code",
  "message": "State code must be 2 letters (e.g., CA, NY, TX)"
}
```

#### 400 Bad Request - Unsupported State

```json
{
  "error": "State not supported",
  "message": "State PA is not currently supported",
  "supported_states": ["AZ", "CA", "CO", ...],
  "total_supported": 14
}
```

#### 400 Bad Request - Invalid Document

```json
{
  "error": "Invalid document",
  "message": "Document text must be at least 50 characters"
}
```

#### 404 Not Found

```json
{
  "error": "Not found",
  "message": "The requested endpoint does not exist"
}
```

#### 413 Payload Too Large

```json
{
  "error": "Request too large",
  "message": "Document exceeds maximum size of 5MB"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

### Current Version (Development)

No rate limiting implemented.

### Production Version (Recommended)

Implement rate limiting to prevent abuse:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1736813600
```

**Recommended Limits**:
- 100 requests per minute per API key
- 1000 requests per hour per API key
- 429 Too Many Requests response when exceeded

---

## Example Workflows

### Workflow 1: Basic Compliance Check

1. **Check API Health**
   ```bash
   curl http://localhost:5000/api/v2/health
   ```

2. **Get Supported States**
   ```bash
   curl http://localhost:5000/api/v2/states
   ```

3. **Analyze Offer Letter**
   ```bash
   curl -X POST http://localhost:5000/api/v2/compliance-check \
     -H "Content-Type: application/json" \
     -d @offer_letter.json
   ```

4. **Review Results**
   - Check `summary.is_compliant`
   - Review `violations` array
   - Filter by `severity` and `confidence`

### Workflow 2: Law Research

1. **Query Relevant Laws**
   ```bash
   curl -X POST http://localhost:5000/api/v2/analyze-laws \
     -H "Content-Type: application/json" \
     -d '{
       "document_text": "Can we ask about salary history?",
       "state": "CA",
       "top_k": 3
     }'
   ```

2. **Review Law Citations**
   - Check `similarity_score` for relevance
   - Read `summary` for quick overview
   - Follow `source_url` for full text

### Workflow 3: Batch Processing

1. **Validate Multiple Documents**
   ```python
   documents = [
     {"text": "...", "state": "CA"},
     {"text": "...", "state": "NY"},
     {"text": "...", "state": "TX"}
   ]

   for doc in documents:
     response = requests.post(
       "http://localhost:5000/api/v2/compliance-check",
       json={"document_text": doc["text"], "state": doc["state"]}
     )
     results.append(response.json())
   ```

---

## SDKs and Code Examples

### Python

```python
import requests

class ComplianceCheckerClient:
    def __init__(self, base_url="http://localhost:5000/api/v2"):
        self.base_url = base_url

    def check_health(self):
        """Check API health"""
        response = requests.get(f"{self.base_url}/health")
        return response.json()

    def get_states(self):
        """Get supported states"""
        response = requests.get(f"{self.base_url}/states")
        return response.json()

    def check_compliance(self, document_text, state, min_confidence=0.3):
        """Check offer letter compliance"""
        payload = {
            "document_text": document_text,
            "state": state,
            "options": {"min_confidence": min_confidence}
        }
        response = requests.post(
            f"{self.base_url}/compliance-check",
            json=payload
        )
        return response.json()

    def analyze_laws(self, document_text, state, top_k=5):
        """Query relevant laws"""
        payload = {
            "document_text": document_text,
            "state": state,
            "top_k": top_k
        }
        response = requests.post(
            f"{self.base_url}/analyze-laws",
            json=payload
        )
        return response.json()

# Usage
client = ComplianceCheckerClient()

# Check health
health = client.check_health()
print(f"API Status: {health['status']}")

# Analyze offer letter
with open("offer_letter.txt", "r") as f:
    offer_text = f.read()

results = client.check_compliance(offer_text, "CA")
print(f"Total Violations: {results['total_violations']}")
print(f"Compliance: {results['summary']['is_compliant']}")

for violation in results['violations']:
    print(f"- {violation['topic']}: {violation['message']}")
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

class ComplianceCheckerClient {
  constructor(baseUrl = 'http://localhost:5000/api/v2') {
    this.baseUrl = baseUrl;
  }

  async checkHealth() {
    const response = await axios.get(`${this.baseUrl}/health`);
    return response.data;
  }

  async getStates() {
    const response = await axios.get(`${this.baseUrl}/states`);
    return response.data;
  }

  async checkCompliance(documentText, state, minConfidence = 0.3) {
    const payload = {
      document_text: documentText,
      state: state,
      options: { min_confidence: minConfidence }
    };
    const response = await axios.post(
      `${this.baseUrl}/compliance-check`,
      payload
    );
    return response.data;
  }

  async analyzeLaws(documentText, state, topK = 5) {
    const payload = {
      document_text: documentText,
      state: state,
      top_k: topK
    };
    const response = await axios.post(
      `${this.baseUrl}/analyze-laws`,
      payload
    );
    return response.data;
  }
}

// Usage
const client = new ComplianceCheckerClient();

(async () => {
  // Check health
  const health = await client.checkHealth();
  console.log(`API Status: ${health.status}`);

  // Analyze offer letter
  const offerText = "Your offer letter text here...";
  const results = await client.checkCompliance(offerText, 'CA');

  console.log(`Total Violations: ${results.total_violations}`);
  console.log(`Compliance: ${results.summary.is_compliant}`);

  results.violations.forEach(v => {
    console.log(`- ${v.topic}: ${v.message}`);
  });
})();
```

### cURL Examples

#### Basic Compliance Check
```bash
curl -X POST http://localhost:5000/api/v2/compliance-check \
  -H "Content-Type: application/json" \
  -d '{
    "document_text": "Your offer letter text here...",
    "state": "CA"
  }'
```

#### With File Input
```bash
curl -X POST http://localhost:5000/api/v2/compliance-check \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "document_text": "$(cat offer_letter.txt)",
  "state": "CA",
  "options": {"min_confidence": 0.3}
}
EOF
```

#### Pretty Print Output
```bash
curl -X POST http://localhost:5000/api/v2/compliance-check \
  -H "Content-Type: application/json" \
  -d '{"document_text": "...","state": "CA"}' \
  | jq '.'
```

---

## Performance Tips

1. **Reuse Connections**: Use connection pooling for multiple requests
2. **Filter by Confidence**: Use `min_confidence` to reduce false positives
3. **Validate First**: Use `/validate-document` before full analysis
4. **Batch Processing**: Process multiple documents sequentially rather than concurrently
5. **Cache Results**: Cache results for identical documents to avoid redundant processing

---

## Support

For questions, issues, or feature requests:

- **GitHub Issues**: https://github.com/your-org/compliance-checker/issues
- **Email**: support@your-domain.com
- **Documentation**: https://docs.your-domain.com

---

## Changelog

### Version 2.0 (January 2026)
- Initial production release
- 14 states supported
- 98 laws database
- Multi-layer validation system
- Hybrid search (semantic + keyword)
- Performance optimizations

---

**Last Updated**: January 13, 2026
**API Version**: 2.0
**Documentation Version**: 1.0
