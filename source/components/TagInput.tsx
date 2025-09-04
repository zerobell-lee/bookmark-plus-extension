import React, { useState, useRef, useEffect } from 'react';
import './TagInput.scss';

interface TagInputProps {
  tags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  onSave?: () => void; // 빈 상태에서 Enter 시 호출될 저장 함수
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  allTags, 
  onChange, 
  placeholder = "Add tags...",
  onSave
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 입력값에 따른 자동완성 제안
  useEffect(() => {
    if (input.trim()) {
      const filtered = allTags
        .filter(tag => 
          tag.toLowerCase().includes(input.toLowerCase()) &&
          !tags.includes(tag)
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestion(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input, tags, allTags]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInput('');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ',':
        e.preventDefault();
        if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
          addTag(suggestions[selectedSuggestion]);
        } else if (input.trim()) {
          addTag(input.trim());
        } else if (!input.trim() && onSave) {
          // 빈 상태에서 Enter → 저장
          onSave();
        }
        break;

      case 'Backspace':
        if (!input && tags.length > 0) {
          removeTag(tags[tags.length - 1]);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="tag-input-container" ref={containerRef}>
      <div className="tag-input-wrapper">
        {tags.map(tag => (
          <span key={tag} className="tag-chip">
            #{tag}
            <button
              type="button"
              className="remove-tag-btn"
              onClick={() => removeTag(tag)}
              title={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={(e) => {
            // 제안 클릭을 위해 약간의 지연
            setTimeout(() => {
              if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                setShowSuggestions(false);
                setSelectedSuggestion(-1);
              }
            }, 150);
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`suggestion-item ${index === selectedSuggestion ? 'selected' : ''}`}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedSuggestion(index)}
            >
              #{suggestion}
            </div>
          ))}
        </div>
      )}

      <small className="tag-help">
        Type and press Enter or comma to add tags. Use Backspace to remove.
        {onSave && <> Press Enter on empty input to save.</>}
      </small>
    </div>
  );
};

export default TagInput;