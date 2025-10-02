import { useState, useEffect, useRef } from 'react';
import './PhotoGallery.css';

const PhotoGallery = ({ photos, onDelete }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const touchStartX = useRef(null);

  const openModal = (index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIndex(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Minimum swipe distance
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextImage(); // Swipe left - next image
      } else {
        prevImage(); // Swipe right - previous image
      }
    }

    touchStartX.current = null;
  };

  // Focus modal when it opens
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isModalOpen]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="photo-gallery">
        <h4 className="gallery-title">Shared Photos</h4>
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div key={photo.id} className="photo-item">
              <img
                src={photo.image_url}
                alt={`Photo ${index + 1}`}
                className="photo-thumbnail"
                onClick={() => openModal(index)}
                loading="lazy"
              />
              {onDelete && (
                <button
                  className="delete-photo-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this photo?')) {
                      onDelete(photo.id);
                    }
                  }}
                  title="Delete photo"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedIndex !== null && (
        <div className="photo-modal" ref={modalRef} onKeyDown={handleKeyDown} tabIndex={0}>
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>

            {photos.length > 1 && (
              <>
                <button className="nav-btn prev-btn" onClick={prevImage}>‹</button>
                <button className="nav-btn next-btn" onClick={nextImage}>›</button>
              </>
            )}

            <div
              className="modal-image-container"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={photos[selectedIndex].image_url}
                alt={`Photo ${selectedIndex + 1}`}
                className="modal-image"
              />
            </div>

            <div className="modal-info">
              <span className="image-counter">
                {selectedIndex + 1} of {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;