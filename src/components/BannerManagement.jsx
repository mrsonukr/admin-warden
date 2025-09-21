import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Card, Dialog, Button, IconButton, AlertDialog, Spinner, TextField } from '@radix-ui/themes';
import { Upload, X, Image as ImageIcon, Trash2, Loader2, Edit } from 'lucide-react';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';

const BannerManagement = ({ isOpen, onClose, wardenData }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [isAddBannerConfirmOpen, setIsAddBannerConfirmOpen] = useState(false);
  const [isEditBannerConfirmOpen, setIsEditBannerConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingImageUpload, setIsEditingImageUpload] = useState(false);
  const [newBannerData, setNewBannerData] = useState({
    image: null,
    link: ''
  });

  // Load banners when component mounts or dialog opens
  useEffect(() => {
    if (isOpen && wardenData?.hostel) {
      loadBanners();
    }
  }, [isOpen, wardenData?.hostel]);

  const loadBanners = async () => {
    try {
      const banners = await fetchBanners();
      // Convert API data to local format
      const formattedBanners = banners.map(banner => ({
        id: banner.id,
        url: banner.img_url,
        name: banner.img_url.split('/').pop() || 'banner.jpg', // Extract filename from URL
        size: 0, // Not provided in API
        type: 'image/webp', // Default type
        link: banner.link || '' // Use link from API if available
      }));
      setUploadedImages(formattedBanners);
    } catch (error) {
      console.error('Error loading banners:', error);
    }
  };

  // Image compression function for 150KB
  const compressImageToWebP = (file, maxSizeKB = 150) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions to maintain aspect ratio
        const maxWidth = 1200;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP with quality adjustment
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const sizeKB = blob.size / 1024;
            console.log(`Compressed banner image size: ${sizeKB.toFixed(2)}KB`);
            
            if (sizeKB <= maxSizeKB || quality <= 0.1) {
              resolve(blob);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          }, 'image/webp', quality);
        };
        
        tryCompress();
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload image to server
  const uploadImage = async (file) => {
    try {
      console.log('Compressing banner image to WebP...');
      const compressedFile = await compressImageToWebP(file, 150);
      
      const formData = new FormData();
      formData.append('image', compressedFile);
      
      console.log('Uploading compressed banner image...');
      const response = await fetch('https://hostel.mssonutech.workers.dev/', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      console.log('Banner image upload response:', data);
      
      if (data.urls && data.urls.length > 0) {
        return data.urls[0]; // Return the first URL
      } else {
        throw new Error('No URL returned from upload service');
      }
    } catch (error) {
      console.error('Error uploading banner image:', error);
      throw error;
    }
  };

  // API Base URL
  const API_BASE = 'https://admin.mssonutech.workers.dev';

  // Get banners by hostel
  const fetchBanners = async () => {
    try {
      const hostelName = wardenData?.hostel_name || wardenData?.hostel || '16B';
      const response = await fetch(`${API_BASE}/banners/${hostelName}`);
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      return data.data || data.banners || [];
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  };

  // Create banner
  const createBanner = async (bannerData) => {
    try {
      const response = await fetch(`${API_BASE}/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create banner');
      }
      
      const data = await response.json();
      return data.banner;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  };

  // Update banner
  const updateBanner = async (bannerId, bannerData) => {
    try {
      const response = await fetch(`${API_BASE}/banners/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update banner');
      }
      
      const data = await response.json();
      return data.banner;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  };

  // Delete banner
  const deleteBanner = async (bannerId) => {
    try {
      const response = await fetch(`${API_BASE}/banners/${bannerId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete banner');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  };

    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            // Simulate file upload
            const newImages = files.map((file, index) => ({
                id: Date.now() + index,
                name: file.name,
                url: URL.createObjectURL(file),
                size: file.size,
                type: file.type,
                link: ''
            }));

            setUploadedImages(prev => [...prev, ...newImages]);

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Images uploaded successfully');
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = (imageId) => {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    };

  const handleLinkChange = (imageId, link) => {
    setUploadedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, link } : img
    ));
  };

  const handleAddBannerClick = () => {
    setNewBannerData({ image: null, link: '' });
    setIsAddBannerOpen(true);
  };

  const handleNewBannerImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewBannerData(prev => ({
        ...prev,
        image: {
          id: Date.now(),
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          file: file // Store the actual file object for upload
        }
      }));
    }
  };

  const handleNewBannerLinkChange = (link) => {
    setNewBannerData(prev => ({ ...prev, link }));
  };

  const handleAddBanner = () => {
    if (newBannerData.image && uploadedImages.length < 3) {
      setIsAddBannerConfirmOpen(true);
    }
  };

  const handleConfirmAddBanner = async () => {
    setIsSaving(true);
    
    try {
      // Upload image first
      const imageUrl = await uploadImage(newBannerData.image.file);
      
      // Prepare banner data for API
      const bannerData = {
        img_url: imageUrl,
        hostel: wardenData?.hostel_name || wardenData?.hostel || '16B',
        uploaded_by: wardenData?.warden_id || wardenData?.id || 1,
        link: newBannerData.link || null
      };
      
      // Create banner via API
      const createdBanner = await createBanner(bannerData);
      
      // Add to local state after successful save
      const newBanner = {
        id: createdBanner.id,
        url: imageUrl,
        name: newBannerData.image.name,
        size: newBannerData.image.size,
        type: newBannerData.image.type,
        link: newBannerData.link || ''
      };
      
      setUploadedImages(prev => [...prev, newBanner]);
      setNewBannerData({ image: null, link: '' });
      setIsAddBannerOpen(false);
      setIsAddBannerConfirmOpen(false);
      
      alert('Banner added successfully!');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert(`Failed to save banner: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAddBanner = () => {
    setIsAddBannerConfirmOpen(false);
  };

  const handleConfirmEditBanner = async () => {
    setIsSaving(true);
    
    try {
      let imageUrl = editingImage.url; // Use existing URL if no new image
      let bannerData = {};
      
      // If new image was uploaded, upload it first
      if (editingImage.file) {
        imageUrl = await uploadImage(editingImage.file);
        // If image changed, send complete data
        bannerData = {
          img_url: imageUrl,
          hostel: wardenData?.hostel_name || wardenData?.hostel || '16B',
          uploaded_by: wardenData?.warden_id || wardenData?.id || 1,
          link: editingImage.link || null
        };
      } else {
        // If only link changed, send minimal data
        bannerData = {
          link: editingImage.link || null
        };
      }
      
      console.log('Updating banner with data:', bannerData);
      
      // Update banner via API
      const apiResponse = await updateBanner(editingImage.id, bannerData);
      console.log('Banner updated successfully:', apiResponse);
      
      // Update local state after successful save
      const updatedBanner = {
        ...editingImage,
        url: imageUrl,
        link: editingImage.link || ''
      };
      
      setUploadedImages(prev => prev.map(img => 
        img.id === editingImage.id ? updatedBanner : img
      ));
      setEditingImage(null);
      setIsEditBannerOpen(false);
      setIsEditBannerConfirmOpen(false);
      
      alert('Banner updated successfully!');
    } catch (error) {
      console.error('Error updating banner:', error);
      alert(`Failed to update banner: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditBanner = () => {
    setIsEditBannerConfirmOpen(false);
  };

  const handleCloseAddBanner = () => {
    setNewBannerData({ image: null, link: '' });
    setIsAddBannerOpen(false);
  };

  const handleEditClick = (image) => {
    setEditingImage(image);
    setIsEditBannerOpen(true);
  };

  const handleDeleteClick = (imageId) => {
    setDeletingImageId(imageId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingImageId) {
      try {
        // Delete from API
        await deleteBanner(deletingImageId);
        
        // Remove from local state
        handleRemoveImage(deletingImageId);
        setDeletingImageId(null);
        setIsDeleteConfirmOpen(false);
        
        alert('Banner deleted successfully!');
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert(`Failed to delete banner: ${error.message}`);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletingImageId(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleCloseEditBanner = () => {
    setEditingImage(null);
    setIsEditBannerOpen(false);
    setIsEditingImageUpload(false);
  };

  const handleEditImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && editingImage) {
      setIsEditingImageUpload(true);
      const newImageData = {
        ...editingImage,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
        file: file // Store the actual file object for upload
      };
      setEditingImage(newImageData);
      setTimeout(() => setIsEditingImageUpload(false), 500);
    }
  };


    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            <style>
                {`
          .banner-dialog-content::-webkit-scrollbar {
            display: none;
          }
          .banner-dialog-content {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .horizontal-scroll::-webkit-scrollbar {
            height: 6px;
          }
          .horizontal-scroll::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .horizontal-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .horizontal-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
            </style>
            <Dialog.Root open={isOpen} onOpenChange={() => { }}>
                 <Dialog.Content className="banner-dialog-content" style={{ width: 'fit-content', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
                    <Flex justify="between" align="center" mb="4">
                        <Dialog.Title>Manage Banner Images</Dialog.Title>
                        <Button 
                            color="indigo" 
                            onClick={handleAddBannerClick}
                            style={{ cursor: 'pointer' }}
                            disabled={uploadedImages.length >= 3}
                        >
                            <Flex align="center" gap="2">
                                <Upload size={16} />
                                Add New Banner ({uploadedImages.length}/3)
                            </Flex>
                        </Button>
                    </Flex>

                    {/* Horizontal Divider */}
                    <Box style={{ height: '1px', backgroundColor: 'var(--gray-6)', margin: '16px 0' }} />

                    {/* Uploaded Images Section */}
                    <Box>
                        <Box
                            style={{
                                display: 'flex',
                                gap: '16px',
                                overflowX: 'auto',
                                paddingBottom: '8px',
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'var(--gray-6) var(--gray-3)'
                            }}
                            className="horizontal-scroll"
                        >
              {[1, 2, 3].map((index) => {
                const image = uploadedImages[index - 1]; // Get image for this slot (0-based index)
                return (
                  <Box 
                    key={image ? image.id : `empty-${index}`}
                    style={{ 
                      padding: '0',
                      overflow: 'hidden',
                      width: '200px',
                      minWidth: '200px',
                      boxSizing: 'border-box',
                      flexShrink: 0,
                      border: '2px dashed var(--gray-6)',
                      backgroundColor: image ? 'var(--gray-2)' : 'transparent',
                      borderRadius: '8px',
                      aspectRatio: '2/1',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: !image ? 'pointer' : 'default'
                    }}
                    onClick={!image ? handleAddBannerClick : undefined}
                  >
                    {image ? (
                      <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img
                          src={image.url}
                          alt={image.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <Box
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            display: 'flex',
                            gap: '4px'
                          }}
                        >
                          <IconButton
                            size="1"
                            variant="solid"
                            color="blue"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleEditClick(image)}
                          >
                            <Pencil1Icon width={12} height={12} />
                          </IconButton>
                          <IconButton
                            size="1"
                            variant="solid"
                            color="red"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDeleteClick(image.id)}
                          >
                            <TrashIcon width={12} height={12} />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Flex 
                        direction="column" 
                        align="center" 
                        gap="2"
                      >
                        <ImageIcon size={32} color="var(--gray-8)" />
                        <Text size="1" color="gray">
                          Add Banner
                        </Text>
                      </Flex>
                    )}
                  </Box>
                );
              })}
                            </Box>
                    </Box>

                    {/* Dialog Actions */}
                    <Flex gap="3" mt="4" justify="end">
                        <Button
                            variant="soft"
                            color="gray"
                            style={{ cursor: 'pointer' }}
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            {/* Add New Banner Dialog */}
            <Dialog.Root open={isAddBannerOpen} onOpenChange={() => {}}>
                <Dialog.Content style={{ maxWidth: 500 }}>
                    <Dialog.Title>Add New Banner</Dialog.Title>
                    
                    <Flex direction="column" gap="4">
                        {/* Image Upload */}
                        <Box>
                            <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                                Upload Image
                            </Text>
                            <Box 
                                style={{ 
                                    padding: newBannerData.image ? '0' : '20px', 
                                    border: '2px dashed var(--gray-6)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    aspectRatio: '2/1',
                                    width: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '8px',
                                    backgroundColor: 'transparent'
                                }}
                                onClick={() => document.getElementById('new-banner-upload').click()}
                            >
                                {newBannerData.image ? (
                                    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <img
                                            src={newBannerData.image.url}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <Box
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                borderRadius: '4px',
                                                padding: '6px 12px',
                                                border: '1px solid rgba(255, 255, 255, 0.2)'
                                            }}
                                        >
                                            <Text size="1" style={{ color: 'white', fontWeight: '500' }}>
                                                Click to change
                                            </Text>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Flex direction="column" align="center" gap="2" style={{ height: '100%', justifyContent: 'center' }}>
                                        <ImageIcon size={48} color="var(--gray-8)" />
                                        <Text size="2" color="gray">
                                            Click to upload image
                                        </Text>
                                        <Text size="1" color="gray">
                                            2:1 ratio recommended
                                        </Text>
                                    </Flex>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleNewBannerImageUpload}
                                    style={{ display: 'none' }}
                                    id="new-banner-upload"
                                />
                            </Box>
                        </Box>

                        {/* Link Input */}
                        <Box>
                            <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                                Link (Optional)
                            </Text>
                            <TextField.Root
                                placeholder="Enter link URL"
                                value={newBannerData.link}
                                onChange={(e) => handleNewBannerLinkChange(e.target.value)}
                            />
                        </Box>
                    </Flex>

                    {/* Dialog Actions */}
                    <Flex gap="3" mt="4" justify="end">
                        <Button 
                            variant="soft" 
                            color="gray" 
                            style={{ cursor: 'pointer' }}
                            onClick={handleCloseAddBanner}
                        >
                            Cancel
                        </Button>
                        <Button 
                            color="indigo"
                            style={{ cursor: 'pointer' }}
                            disabled={!newBannerData.image}
                            onClick={handleAddBanner}
                        >
                            Add Banner
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            {/* Edit Banner Dialog */}
            <Dialog.Root open={isEditBannerOpen} onOpenChange={() => {}}>
                <Dialog.Content style={{ maxWidth: 500 }}>
                    <Dialog.Title>Edit Banner</Dialog.Title>
                    
                    <Flex direction="column" gap="4">
                        {/* Image Display */}
                        <Box>
                            <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                                Current Image
                            </Text>
                            <Box 
                                style={{ 
                                    padding: '0',
                                    border: '2px dashed var(--gray-6)',
                                    borderRadius: '8px',
                                    aspectRatio: '2/1',
                                    width: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('edit-banner-upload').click()}
                            >
                                {editingImage && (
                                    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <img
                                            src={editingImage.url}
                                            alt={editingImage.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <Box
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                borderRadius: '4px',
                                                padding: '6px 12px',
                                                border: '1px solid rgba(255, 255, 255, 0.2)'
                                            }}
                                        >
                                            <Text size="1" style={{ color: 'white', fontWeight: '500' }}>
                                                Click to change
                                            </Text>
                                        </Box>
                                    </Box>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditImageUpload}
                                    style={{ display: 'none' }}
                                    id="edit-banner-upload"
                                />
                            </Box>
                        </Box>

                        {/* Link Input */}
                        <Box>
                            <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                                Link (Optional)
                            </Text>
                            <TextField.Root
                                placeholder="Enter link URL"
                                value={editingImage?.link || ''}
                                onChange={(e) => {
                                    if (editingImage) {
                                        setEditingImage({ ...editingImage, link: e.target.value });
                                    }
                                }}
                            />
                        </Box>
                    </Flex>

                    {/* Dialog Actions */}
                    <Flex gap="3" mt="4" justify="end">
                        <Button 
                            variant="soft" 
                            color="gray" 
                            style={{ cursor: 'pointer' }}
                            onClick={handleCloseEditBanner}
                        >
                            Cancel
                        </Button>
                        <Button 
                            color="indigo"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                if (editingImage) {
                                    setIsEditBannerConfirmOpen(true);
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            {/* Delete Confirmation Dialog */}
            <AlertDialog.Root open={isDeleteConfirmOpen} onOpenChange={() => {}}>
                <AlertDialog.Content style={{ maxWidth: 400 }}>
                    <AlertDialog.Title>Delete Banner</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Are you sure you want to delete this banner? This action cannot be undone.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button 
                                variant="soft" 
                                color="gray" 
                                style={{ cursor: 'pointer' }}
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button 
                                color="red" 
                                style={{ cursor: 'pointer' }}
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>

            {/* Add Banner Confirmation Dialog */}
            <AlertDialog.Root open={isAddBannerConfirmOpen} onOpenChange={() => {}}>
                <AlertDialog.Content style={{ maxWidth: 450 }}>
                    <AlertDialog.Title>Add New Banner</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        This banner will be displayed to all students in Hostel-{wardenData?.hostel || '13B'}. Are you sure you want to add this banner?
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button 
                                variant="soft" 
                                color="gray" 
                                style={{ cursor: 'pointer' }}
                                onClick={handleCancelAddBanner}
                            >
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button 
                                color="indigo" 
                                style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}
                                onClick={handleConfirmAddBanner}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Flex align="center" gap="2">
                                        <Spinner size="1" />
                                        Adding...
                                    </Flex>
                                ) : (
                                    'Add Banner'
                                )}
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>

            {/* Edit Banner Confirmation Dialog */}
            <AlertDialog.Root open={isEditBannerConfirmOpen} onOpenChange={() => {}}>
                <AlertDialog.Content style={{ maxWidth: 450 }}>
                    <AlertDialog.Title>Update Banner</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        This banner will be updated and displayed to all students in Hostel-{wardenData?.hostel || '13B'}. Are you sure you want to save these changes?
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button 
                                variant="soft" 
                                color="gray" 
                                style={{ cursor: 'pointer' }}
                                onClick={handleCancelEditBanner}
                            >
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button 
                                color="indigo" 
                                style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}
                                onClick={handleConfirmEditBanner}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Flex align="center" gap="2">
                                        <Spinner size="1" />
                                        Updating...
                                    </Flex>
                                ) : (
                                    'Update Banner'
                                )}
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </>
    );
};

export default BannerManagement;
