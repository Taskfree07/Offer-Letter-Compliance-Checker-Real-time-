import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * SearchableStateDropdown - A fully accessible, searchable combobox for U.S. states
 *
 * Features:
 * - Single input that acts as both dropdown selector and search input
 * - Click to show full list, type to filter
 * - Keyboard navigation (Arrow keys, Enter, Escape, Tab)
 * - ARIA-compliant for screen readers
 * - Mobile-friendly with touch support
 * - Only allows selection from valid 50 states
 *
 * @param {Object} props
 * @param {string} props.value - Currently selected state code (e.g., 'CA')
 * @param {function} props.onChange - Callback when state is selected: (stateCode) => void
 * @param {string} props.placeholder - Placeholder text (default: 'Search or select a state...')
 * @param {boolean} props.disabled - Disable the dropdown
 * @param {string} props.id - HTML id for the input (for label association)
 * @param {Object} props.style - Additional styles for the container
 */

// Complete list of all 50 U.S. states with codes and names
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

const SearchableStateDropdown = ({
  value,
  onChange,
  placeholder = 'Search or select a state...',
  disabled = false,
  id = 'state-select',
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listboxId = `${id}-listbox`;

  // Get the display name for the currently selected state
  const selectedState = useMemo(() =>
    US_STATES.find(s => s.code === value),
    [value]
  );

  // Filter states based on search query
  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return US_STATES;

    const query = searchQuery.toLowerCase().trim();
    return US_STATES.filter(state =>
      state.name.toLowerCase().includes(query) ||
      state.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(filteredStates.length > 0 ? 0 : -1);
  }, [filteredStates]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedItem = listRef.current.children[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search query when closing without selection
        if (!value) {
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [value]);

  // Handle state selection
  const handleSelect = useCallback((state) => {
    onChange(state.code);
    setSearchQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < filteredStates.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredStates[highlightedIndex]) {
          handleSelect(filteredStates[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;

      case 'Tab':
        // Allow natural tab behavior but close dropdown
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
        }
        break;

      case 'Home':
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case 'End':
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(filteredStates.length - 1);
        }
        break;

      default:
        break;
    }
  }, [disabled, isOpen, highlightedIndex, filteredStates, handleSelect]);

  // Handle input change
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setSearchQuery(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setIsFocused(false);
  };

  // Clear selection
  const handleClear = (event) => {
    event.stopPropagation();
    setSearchQuery('');
    onChange('');
    inputRef.current?.focus();
  };

  // Get the display value for the input
  const getInputValue = () => {
    if (isOpen || isFocused) {
      return searchQuery;
    }
    return selectedState ? `${selectedState.name} (${selectedState.code})` : '';
  };

  // Styles
  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      ...style
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: '10px 70px 10px 36px',
      border: `1px solid ${isFocused ? '#3b82f6' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: disabled ? '#f3f4f6' : '#fff',
      cursor: disabled ? 'not-allowed' : 'text',
      outline: 'none',
      boxShadow: isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
    },
    searchIcon: {
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      pointerEvents: 'none'
    },
    rightIcons: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    clearButton: {
      padding: '4px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'color 0.15s ease, background-color 0.15s ease'
    },
    chevron: {
      color: '#6b7280',
      transition: 'transform 0.2s ease',
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      maxHeight: '280px',
      overflowY: 'auto',
      backgroundColor: '#fff',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 1000,
      listStyle: 'none',
      margin: 0,
      padding: '4px 0'
    },
    option: (isHighlighted, isSelected) => ({
      padding: '10px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isHighlighted ? '#f3f4f6' : isSelected ? '#eff6ff' : 'transparent',
      color: isSelected ? '#1d4ed8' : '#374151',
      fontWeight: isSelected ? '500' : '400',
      transition: 'background-color 0.1s ease'
    }),
    optionText: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    stateCode: {
      fontSize: '12px',
      color: '#6b7280',
      fontFamily: 'monospace',
      backgroundColor: '#f3f4f6',
      padding: '2px 6px',
      borderRadius: '3px'
    },
    noResults: {
      padding: '12px',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px'
    },
    srOnly: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0
    }
  };

  return (
    <div
      ref={containerRef}
      style={styles.container}
    >
      {/* Hidden live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={styles.srOnly}
      >
        {isOpen && filteredStates.length > 0
          ? `${filteredStates.length} states available. Use arrow keys to navigate.`
          : isOpen && filteredStates.length === 0
            ? 'No states found matching your search.'
            : ''
        }
      </div>

      <div style={styles.inputWrapper}>
        {/* Search icon */}
        <Search size={16} style={styles.searchIcon} aria-hidden="true" />

        {/* Main input - acts as both search and display */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0 && filteredStates[highlightedIndex]
              ? `${id}-option-${filteredStates[highlightedIndex].code}`
              : undefined
          }
          aria-autocomplete="list"
          aria-label="Select U.S. state"
          value={getInputValue()}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          style={styles.input}
        />

        {/* Right side icons */}
        <div style={styles.rightIcons}>
          {/* Clear button - only show when there's a selection */}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              style={styles.clearButton}
              tabIndex={-1}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={16} />
            </button>
          )}

          {/* Dropdown chevron */}
          <ChevronDown
            size={18}
            style={styles.chevron}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="U.S. States"
          style={styles.dropdown}
        >
          {filteredStates.length > 0 ? (
            filteredStates.map((state, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = state.code === value;

              return (
                <li
                  key={state.code}
                  id={`${id}-option-${state.code}`}
                  role="option"
                  aria-selected={isSelected}
                  style={styles.option(isHighlighted, isSelected)}
                  onClick={() => handleSelect(state)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onTouchStart={() => setHighlightedIndex(index)}
                >
                  <span style={styles.optionText}>
                    <span style={styles.stateCode}>{state.code}</span>
                    <span>{state.name}</span>
                  </span>
                  {isSelected && (
                    <Check size={16} style={{ color: '#1d4ed8' }} aria-hidden="true" />
                  )}
                </li>
              );
            })
          ) : (
            <li style={styles.noResults} role="option" aria-disabled="true">
              No states found for "{searchQuery}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

// Export both the component and the states list for flexibility
export { US_STATES };
export default SearchableStateDropdown;
