import React, { useState } from 'react';
import './RatingStars.css';

const RatingStars = ({ 
  rating, 
  size = 'medium', 
  showNumber = false, 
  readOnly = true, 
  onChange,
  interactive = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [localRating, setLocalRating] = useState(rating || 0);

  const handleClick = (value) => {
    if (!readOnly && onChange) {
      setLocalRating(value);
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive && !readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive && !readOnly) {
      setHoverRating(0);
    }
  };

  const getStarClass = (starValue) => {
    const displayRating = hoverRating || localRating;
    if (starValue <= displayRating) {
      return 'star-filled';
    }
    if (starValue - 0.5 <= displayRating) {
      return 'star-half';
    }
    return 'star-empty';
  };

  const sizes = {
    small: '16px',
    medium: '20px',
    large: '28px'
  };

  React.useEffect(() => {
    setLocalRating(rating || 0);
  }, [rating]);

  return (
    <div className="rating-stars">
      <div 
        className="stars-container"
        style={{ fontSize: sizes[size] }}
        onMouseLeave={interactive ? handleMouseLeave : undefined}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${getStarClass(star)} ${interactive ? 'interactive' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => interactive && handleMouseEnter(star)}
            style={{ 
              cursor: interactive && !readOnly ? 'pointer' : 'default',
              marginRight: '2px'
            }}
          >
            ★
          </span>
        ))}
      </div>
      {showNumber && localRating > 0 && (
        <span className="rating-number">
          ({localRating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;