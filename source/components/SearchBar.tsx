import React from 'react';
import './SearchBar.scss';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search bookmarks, URLs, and tags..."
          value={searchQuery}
          onChange={handleInputChange}
        />
        {searchQuery && (
          <button 
            className="clear-search-btn"
            onClick={clearSearch}
            title="Clear search"
          >
            &#10006;
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;