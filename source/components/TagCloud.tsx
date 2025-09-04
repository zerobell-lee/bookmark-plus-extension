import React from 'react';
import './TagCloud.scss';

interface TagCloudProps {
  tags: Set<string>;
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, selectedTags, onTagToggle }) => {
  const tagsArray = Array.from(tags).sort();

  if (tagsArray.length === 0) {
    return (
      <div className="tag-cloud empty">
        <div className="empty-message">
          &#127991; No tags available
        </div>
      </div>
    );
  }

  return (
    <div className="tag-cloud">
      <div className="tag-cloud-header">
        <span className="tag-cloud-title">&#127991; Tags</span>
        {selectedTags.size > 0 && (
          <button 
            className="clear-tags-btn"
            onClick={() => {
              selectedTags.forEach(tag => onTagToggle(tag));
            }}
            title="Clear all selected tags"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="tags-container">
        {tagsArray.map(tag => (
          <button
            key={tag}
            className={`tag-item ${selectedTags.has(tag) ? 'selected' : ''}`}
            onClick={() => onTagToggle(tag)}
            title={`${selectedTags.has(tag) ? 'Remove' : 'Add'} tag filter: ${tag}`}
          >
            #{tag}
            {selectedTags.has(tag) && (
              <span className="selected-indicator">&#10004;</span>
            )}
          </button>
        ))}
      </div>
      
      {selectedTags.size > 0 && (
        <div className="selected-tags-info">
          Showing bookmarks with: {Array.from(selectedTags).join(', ')}
        </div>
      )}
    </div>
  );
};

export default TagCloud;