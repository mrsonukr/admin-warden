import React from 'react';
import { X } from 'lucide-react';

const ImageModal = ({ isOpen, imageUrl, isProfileImage, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "90vw",
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={isProfileImage ? "Student profile picture" : "Complaint photo"}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: isProfileImage ? "50%" : "12px",
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            color: "white",
            cursor: "pointer",
            width: "36px",
            height: "36px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <X size="32" />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
