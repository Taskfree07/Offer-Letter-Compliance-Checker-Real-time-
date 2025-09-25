import React, { useState, useEffect } from 'react';
import './EntityHighlighter.css';

/**
 * EntityHighlighter Component
 * Displays text with highlighted entities and provides variable suggestions
 */
const EntityHighlighter = ({ 
  text, 
  entities = [], 
  onVariableSelect, 
  onEntityClick,
  showSuggestions = true,
  className = ''
}) => {
  const [highlightedSegments, setHighlightedSegments] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [variableSuggestions, setVariableSuggestions] = useState({});

  useEffect(() => {
    if (text && entities.length > 0) {
      const segments = generateHighlightingSegments(text, entities);
      setHighlightedSegments(segments);
    } else {
      setHighlightedSegments([{ text, isEntity: false }]);
    }
  }, [text, entities]);

  const generateHighlightingSegments = (text, entities) => {
    if (!entities || entities.length === 0) {
      return [{ text, isEntity: false }];
    }

    const segments = [];
    let lastEnd = 0;

    // Sort entities by start position
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

    for (const entity of sortedEntities) {
      // Add text before entity
      if (entity.start > lastEnd) {
        segments.push({
          text: text.slice(lastEnd, entity.start),
          isEntity: false
        });
      }

      // Add entity
      segments.push({
        text: entity.text,
        isEntity: true,
        entityType: entity.label,
        confidence: entity.confidence,
        description: entity.description,
        start: entity.start,
        end: entity.end,
        entityData: entity
      });

      lastEnd = entity.end;
    }

    // Add remaining text
    if (lastEnd < text.length) {
      segments.push({
        text: text.slice(lastEnd),
        isEntity: false
      });
    }

    return segments;
  };

  const handleEntityClick = (segment) => {
    if (segment.isEntity) {
      setSelectedEntity(segment);
      if (onEntityClick) {
        onEntityClick(segment.entityData);
      }
    }
  };

  const handleVariableSelection = (variableName, entityData) => {
    if (onVariableSelect) {
      onVariableSelect(variableName, entityData);
    }
    setSelectedEntity(null);
  };

  const getEntityColor = (entityType) => {
    const colors = {
      'PERSON': '#e3f2fd',
      'ORG': '#f3e5f5',
      'EMAIL': '#e8f5e8',
      'PHONE': '#fff3e0',
      'MONEY': '#fce4ec',
      'DATE': '#e0f2f1',
      'GPE': '#f1f8e9',
      'JOB_TITLE': '#e1f5fe',
      'SALARY': '#fce4ec',
      'URL': '#f9fbe7',
      'default': '#f5f5f5'
    };
    return colors[entityType] || colors.default;
  };

  const getVariableSuggestions = (entityType) => {
    const suggestions = {
      'PERSON': ['[CANDIDATE_NAME]', '[EMPLOYEE_NAME]', '[CONTACT_NAME]'],
      'ORG': ['[COMPANY_NAME]', '[ORGANIZATION]', '[CLIENT_NAME]'],
      'EMAIL': ['[EMAIL_ADDRESS]', '[CONTACT_EMAIL]', '[SENDER_EMAIL]'],
      'PHONE': ['[PHONE_NUMBER]', '[CONTACT_PHONE]', '[MOBILE_NUMBER]'],
      'MONEY': ['[SALARY]', '[AMOUNT]', '[COMPENSATION]'],
      'SALARY': ['[SALARY]', '[ANNUAL_SALARY]', '[COMPENSATION]'],
      'DATE': ['[START_DATE]', '[END_DATE]', '[DATE]'],
      'GPE': ['[LOCATION]', '[CITY]', '[STATE]'],
      'JOB_TITLE': ['[POSITION]', '[JOB_TITLE]', '[ROLE]'],
      'URL': ['[WEBSITE]', '[LINK]', '[URL]']
    };
    return suggestions[entityType] || ['[VARIABLE]'];
  };

  return (
    <div className={`entity-highlighter ${className}`}>
      <div className="highlighted-text">
        {highlightedSegments.map((segment, index) => (
          <span
            key={index}
            className={segment.isEntity ? 'entity-highlight' : 'regular-text'}
            style={{
              backgroundColor: segment.isEntity ? getEntityColor(segment.entityType) : 'transparent',
              cursor: segment.isEntity ? 'pointer' : 'default',
              padding: segment.isEntity ? '2px 4px' : '0',
              borderRadius: segment.isEntity ? '3px' : '0',
              border: segment.isEntity ? '1px solid #ddd' : 'none',
              margin: segment.isEntity ? '0 1px' : '0'
            }}
            onClick={() => handleEntityClick(segment)}
            title={segment.isEntity ? `${segment.entityType}: ${segment.description} (${Math.round(segment.confidence * 100)}% confidence)` : ''}
          >
            {segment.text}
          </span>
        ))}
      </div>

      {/* Entity Details Modal */}
      {selectedEntity && (
        <div className="entity-modal-overlay" onClick={() => setSelectedEntity(null)}>
          <div className="entity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="entity-modal-header">
              <h3>Entity Details</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedEntity(null)}
              >
                ×
              </button>
            </div>
            
            <div className="entity-modal-content">
              <div className="entity-info">
                <p><strong>Text:</strong> {selectedEntity.text}</p>
                <p><strong>Type:</strong> {selectedEntity.entityType}</p>
                <p><strong>Description:</strong> {selectedEntity.description}</p>
                <p><strong>Confidence:</strong> {Math.round(selectedEntity.confidence * 100)}%</p>
              </div>

              {showSuggestions && (
                <div className="variable-suggestions">
                  <h4>Suggested Variables:</h4>
                  <div className="suggestion-buttons">
                    {getVariableSuggestions(selectedEntity.entityType).map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-button"
                        onClick={() => handleVariableSelection(suggestion, selectedEntity.entityData)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Entity Legend */}
      <div className="entity-legend">
        <h4>Entity Types:</h4>
        <div className="legend-items">
          {Array.from(new Set(entities.map(e => e.label))).map(entityType => (
            <div key={entityType} className="legend-item">
              <span 
                className="legend-color"
                style={{ backgroundColor: getEntityColor(entityType) }}
              ></span>
              <span className="legend-label">{entityType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntityHighlighter;
