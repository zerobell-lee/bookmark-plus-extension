import React from 'react';
import { SearchResult } from '../types/Bookmark';
import './SearchResults.scss';

interface SearchResultsProps {
  results: SearchResult[];
  onBookmarkClick: (url: string, inBackground?: boolean) => void;
  onBookmarkRightClick?: (e: React.MouseEvent, searchResult: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  onBookmarkClick, 
  onBookmarkRightClick 
}) => {
  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results__empty">
          <div className="search-results__empty-icon">🔍</div>
          <div className="search-results__empty-message">No bookmarks found</div>
        </div>
      </div>
    );
  }

  const handleBookmarkClick = (e: React.MouseEvent, searchResult: SearchResult) => {
    if (e.button === 0) { // Left click
      onBookmarkClick(searchResult.bookmark.url, false);
    } else if (e.button === 1) { // Middle click
      e.preventDefault();
      onBookmarkClick(searchResult.bookmark.url, true);
    }
  };

  const handleRightClick = (e: React.MouseEvent, searchResult: SearchResult) => {
    e.preventDefault();
    if (onBookmarkRightClick) {
      onBookmarkRightClick(e, searchResult);
    }
  };

  const getMatchTypeLabel = (matchType: SearchResult['matchType']): string => {
    switch (matchType) {
      case 'title':
        return 'Title';
      case 'url':
        return 'URL';
      case 'tag':
        return 'Tag';
      case 'description':
        return 'Description';
      default:
        return 'Match';
    }
  };

  const getMatchTypeIcon = (matchType: SearchResult['matchType']): string => {
    switch (matchType) {
      case 'title':
        return '📄';
      case 'url':
        return '🔗';
      case 'tag':
        return '🏷️';
      case 'description':
        return '📝';
      default:
        return '🔍';
    }
  };

  return (
    <div className="search-results">
      <div className="search-results__header">
        <span className="search-results__count">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="search-results__list">
        {results.map((result, index) => (
          <div 
            key={`${result.bookmark.id}-${result.matchType}-${index}`}
            className="search-result-item"
            onClick={(e) => handleBookmarkClick(e, result)}
            onMouseDown={(e) => handleBookmarkClick(e, result)}
            onContextMenu={(e) => handleRightClick(e, result)}
          >
            <div className="search-result-item__main">
              <div className="search-result-item__header">
                <img 
                  src={result.bookmark.favicon || '/assets/icons/default-favicon.svg'} 
                  alt="Favicon"
                  className="search-result-item__favicon"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/icons/default-favicon.svg';
                  }}
                />
                <div className="search-result-item__title-section">
                  <div className="search-result-item__title">
                    {result.bookmark.title}
                  </div>
                  <div className="search-result-item__url">
                    {result.bookmark.url}
                  </div>
                </div>
              </div>

              <div className="search-result-item__location">
                <span className="search-result-item__folder-icon">📁</span>
                <span className="search-result-item__folder-path">
                  {result.folderPath}
                </span>
              </div>

              <div className="search-result-item__match-info">
                <span className="search-result-item__match-type">
                  <span className="search-result-item__match-icon">
                    {getMatchTypeIcon(result.matchType)}
                  </span>
                  {getMatchTypeLabel(result.matchType)}: 
                </span>
                <span className="search-result-item__match-text">
                  {result.matchText}
                </span>
              </div>

              {result.bookmark.tags && result.bookmark.tags.length > 0 && (
                <div className="search-result-item__tags">
                  {result.bookmark.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="search-result-item__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {result.bookmark.hasRichPreview && result.bookmark.openGraph && (
                <div className="search-result-item__preview">
                  {result.bookmark.openGraph.image && (
                    <img 
                      src={result.bookmark.openGraph.image}
                      alt="Preview"
                      className="search-result-item__preview-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  {result.bookmark.openGraph.description && (
                    <div className="search-result-item__preview-description">
                      {result.bookmark.openGraph.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;