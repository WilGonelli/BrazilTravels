import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import styles from './DestinationSearchBar.module.css';
import { BrazilMapViewModelContract } from '../../../viewmodels/useBrazilMapViewModel';
import { Destination, DestinationCategory } from '../../../models/Destination';

interface DestinationSearchBarProps {
  readonly viewModel: BrazilMapViewModelContract;
}

const CATEGORY_ICONS: Record<DestinationCategory, string> = {
  Beach: '🏖️',
  Waterfall: '🌊',
  FamousCity: '🏙️',
  TouristSpot: '🏛️',
  Island: '🏝️',
  State: '📍',
};

/**
 * Accessible search input with real-time autocomplete suggestions for Brazilian tourist destinations.
 */
export const DestinationSearchBar: React.FC<DestinationSearchBarProps> = ({ viewModel }) => {
  const { state, actions } = viewModel;
  const { searchQuery, searchResults } = state;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when query produces results
  useEffect(() => {
    if (searchResults.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(0);
    } else {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [searchResults]);

  const handleSelect = useCallback(
    (destination: Destination) => {
      actions.handleSelectSearchResult(destination);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [actions]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        handleSelect(searchResults[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      actions.handleClearSearch();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">
          🔍
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedIndex >= 0 && searchResults[highlightedIndex]
              ? `option-${searchResults[highlightedIndex].id}`
              : undefined
          }
          className={styles.searchInput}
          placeholder="Buscar praias, cachoeiras, cidades..."
          value={searchQuery}
          onChange={(e) => actions.handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Buscar destinos turísticos do Brasil"
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              actions.handleClearSearch();
              inputRef.current?.focus();
            }}
            aria-label="Limpar campo de busca"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <ul id={listboxId} role="listbox" className={styles.dropdown} aria-label="Destinos encontrados">
          {searchResults.map((dest, index) => {
            const isHighlighted = index === highlightedIndex;
            const icon = CATEGORY_ICONS[dest.category] || '📍';

            return (
              <li
                key={dest.id}
                id={`option-${dest.id}`}
                role="option"
                aria-selected={isHighlighted}
                className={`${styles.suggestionItem} ${isHighlighted ? styles.highlighted : ''}`}
                onClick={() => handleSelect(dest)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className={styles.itemMain}>
                  <span className={styles.categoryIcon} aria-hidden="true">
                    {icon}
                  </span>
                  <span className={styles.itemName}>{dest.name}</span>
                  <span className={styles.stateBadge}>{dest.stateCode}</span>
                </div>
                {dest.isUnlocked ? (
                  <span className={styles.statusUnlocked}>✓ Liberado</span>
                ) : (
                  <span className={styles.statusLocked}>🔒 Desbloquear</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
