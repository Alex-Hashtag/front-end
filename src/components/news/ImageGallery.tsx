import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  altPrefix?: string;
}

export default function ImageGallery({ images, altPrefix = 'Image' }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="image-gallery">
      <h3 className="gallery-title">Gallery</h3>
      <div className="gallery-thumbnails">
        {images.map((image, index) => (
          <div 
            key={`${index}-${image}`} 
            className="gallery-thumbnail-container"
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image}
              alt={`${altPrefix} ${index + 1}`}
              className="gallery-thumbnail"
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="gallery-modal" onClick={handleCloseModal}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close-btn" onClick={handleCloseModal}>
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="gallery-modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}
