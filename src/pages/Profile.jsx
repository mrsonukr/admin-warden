import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { updateWardenProfile, changeWardenPassword } from '../services/api';
import {
    Box,
    Text,
    Flex,
    Card,
    Avatar,
    Separator,
    Badge,
    IconButton,
    DataList,
    Button,
    Dialog,
    TextField,
    SegmentedControl,
    Spinner
} from "@radix-ui/themes";
import { User, Mail, Phone, MapPin, Calendar, Copy, Edit, Upload, X, Key } from 'lucide-react';

const Profile = () => {
    const { user, wardenData, fetchWardenInfo } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        const savedCollapsed = localStorage.getItem('sidebarCollapsed');
        return savedCollapsed === 'true';
    });
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = React.useState(false);
    const [editData, setEditData] = React.useState({
        email: '',
        phone: '',
        gender: 'male'
    });
    const [passwordData, setPasswordData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [selectedGender, setSelectedGender] = React.useState('male');
    const [profileImage, setProfileImage] = React.useState(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleEditClick = () => {
        const currentGender = (wardenData?.gender || 'male').toLowerCase();
        console.log('Opening edit dialog with gender:', currentGender);
        console.log('wardenData.gender:', wardenData?.gender);
        setEditData({
            email: wardenData?.email || '',
            phone: wardenData?.phone || '',
            gender: currentGender
        });
        setSelectedGender(currentGender);
        console.log('Set selectedGender to:', currentGender);
        setIsEditDialogOpen(true);
    };

    const handleChangePasswordClick = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsChangePasswordDialogOpen(true);
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordInputChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log('Saving profile data:', editData);
            console.log('Profile image:', profileImage);
            
            // Prepare the data to send (only include fields that have changed)
            const updateData = {};
            
            if (editData.email && editData.email !== wardenData?.email) {
                updateData.email = editData.email;
            }
            
            if (editData.phone && editData.phone !== wardenData?.phone) {
                updateData.phone = editData.phone;
            }
            
            if (editData.gender && editData.gender !== wardenData?.gender?.toLowerCase()) {
                updateData.gender = editData.gender.charAt(0).toUpperCase() + editData.gender.slice(1);
            }
            
            // Upload profile picture if selected
            if (profileImage) {
                console.log('Uploading profile image:', profileImage.name);
                try {
                    const imageUrl = await uploadProfileImage(profileImage);
                    updateData.profile_pic = imageUrl;
                    console.log('Profile image uploaded successfully:', imageUrl);
                } catch (error) {
                    console.error('Failed to upload profile image:', error);
                    alert('Failed to upload profile image. Please try again.');
                    setIsSaving(false);
                    return; // Stop the save process if image upload fails
                }
            }
            
            if (Object.keys(updateData).length > 0) {
                const wardenId = wardenData?.id || wardenData?.warden_id;
                const response = await updateWardenProfile(wardenId, updateData, user?.token);
                console.log('Profile updated successfully:', response);
                
                // Refresh warden data to show updated information
                if (fetchWardenInfo) {
                    await fetchWardenInfo(user?.token);
                }
            } else {
                console.log('No changes to save');
            }
            
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditDialogOpen(false);
    };

    const handleChangePassword = async () => {
        // Validate passwords
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            alert('Please fill in all password fields.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New password and confirm password do not match.');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }

        setIsChangingPassword(true);
        try {
            const wardenId = wardenData?.id || wardenData?.warden_id;
            const response = await changeWardenPassword(wardenId, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, user?.token);
            
            console.log('Password changed successfully:', response);
            alert('Password changed successfully!');
            setIsChangePasswordDialogOpen(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            alert(error.message || 'Failed to change password. Please try again.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleCancelPasswordChange = () => {
        setIsChangePasswordDialogOpen(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const compressImageToWebP = (file, maxSizeKB = 25) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions to maintain aspect ratio
                const maxWidth = 800;
                const maxHeight = 800;
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
                        console.log(`Compressed image size: ${sizeKB.toFixed(2)}KB`);
                        
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

    const uploadProfileImage = async (file) => {
        try {
            console.log('Compressing image to WebP...');
            const compressedFile = await compressImageToWebP(file, 25);
            
            const formData = new FormData();
            formData.append('image', compressedFile);
            
            console.log('Uploading compressed image...');
            const response = await fetch('https://hostel.mssonutech.workers.dev/', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            
            const data = await response.json();
            console.log('Image upload response:', data);
            
            if (data.urls && data.urls.length > 0) {
                return data.urls[0]; // Return the first URL
            } else {
                throw new Error('No URL returned from upload service');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Selected file:', file);
            setProfileImage(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    if (!wardenData) {
        return (
            <Flex style={{ minHeight: '100vh' }}>
                <Sidebar onCollapseChange={setIsSidebarCollapsed} />
                <Box style={{
                    flex: 1,
                    padding: '24px',
                    marginLeft: isSidebarCollapsed ? '64px' : '240px',
                    minHeight: '100vh',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'margin-left 0.3s ease',
                    width: isSidebarCollapsed ? 'calc(100vw - 64px)' : 'calc(100vw - 240px)'
                }}>
                    <Text size="4" color="gray">Loading profile...</Text>
                </Box>
            </Flex>
        );
    }

    return (
        <Flex style={{ minHeight: '100vh' }}>
            <Sidebar onCollapseChange={setIsSidebarCollapsed} />

            <Box style={{
                flex: 1,
                padding: '24px',
                marginLeft: isSidebarCollapsed ? '64px' : '240px',
                minHeight: '100vh',
                backgroundColor: 'var(--color-background)',
                transition: 'margin-left 0.3s ease',
                width: isSidebarCollapsed ? 'calc(100vw - 64px)' : 'calc(100vw - 240px)'
            }}>
                {/* Header */}
                <Flex align="center" justify="between" mb="6">
                    <Text size="6" weight="bold">Profile</Text>
                </Flex>

                <Flex>
                    {/* Profile Card */}
                    <Box style={{ width: '100%' }}>
                        <Card>
                            <Box style={{ padding: '24px' }}>
                                <Flex direction="column" gap="4">
                                    {/* Profile Header */}
                                    <Flex align="center" justify="between" mb="4">
                                        <Flex align="center" gap="4">
                                                                                    <Avatar
                                            size="6"
                                            src={wardenData?.profile_pic}
                                            fallback={wardenData.name?.charAt(0) || 'W'}
                                            radius="full"
                                        />
                                            <Flex direction="column" gap="1">
                                                <Text size="5" weight="bold">
                                                    {wardenData.name || 'Warden Name'}
                                                </Text>
                                                <Flex align="center" gap="2">
                                                    <Badge color="indigo" size="2">
                                                        WID
                                                    </Badge>
                                                    <Text size="2" color="gray">
                                                        {wardenData?.id || wardenData?.warden_id || 'Warden ID'}
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                        <Flex gap="2">
                                            <Button variant="soft" color="indigo" style={{ cursor: 'pointer' }} onClick={handleEditClick}>
                                                <Edit size="16" />
                                                Edit Profile
                                            </Button>
                                            <Button variant="soft" color="indigo" style={{ cursor: 'pointer' }} onClick={handleChangePasswordClick}>
                                                <Key size="16" />
                                                Change Password
                                            </Button>
                                        </Flex>
                                    </Flex>

                                    {/* Profile Details */}
                                    <Flex gap="6">
                                        {/* Left Column */}
                                        <Box style={{ flex: 1 }}>
                                            <DataList.Root>
                                                <DataList.Item>
                                                    <DataList.Label minWidth="88px">Warden ID</DataList.Label>
                                                    <DataList.Value>
                                                        <Flex align="center" gap="2">
                                                            <Text size="2" weight="medium" style={{ fontFamily: 'monospace' }}>
                                                                {wardenData?.id || wardenData?.warden_id || 'N/A'}
                                                            </Text>
                                                            <IconButton
                                                                size="1"
                                                                aria-label="Copy Warden ID"
                                                                color="gray"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(wardenData?.id || wardenData?.warden_id || '');
                                                                }}
                                                            >
                                                                <Copy size="12" />
                                                            </IconButton>
                                                        </Flex>
                                                    </DataList.Value>
                                                </DataList.Item>

                                                <DataList.Item>
                                                    <DataList.Label minWidth="88px">Email</DataList.Label>
                                                    <DataList.Value>{wardenData.email || 'No email provided'}</DataList.Value>
                                                </DataList.Item>

                                                <DataList.Item>
                                                    <DataList.Label minWidth="88px">Phone</DataList.Label>
                                                    <DataList.Value>{wardenData.phone || 'No phone provided'}</DataList.Value>
                                                </DataList.Item>
                                            </DataList.Root>
                                        </Box>

                                        <Separator orientation="vertical" style={{ height: '100%', minHeight: '120px' }} />

                                        {/* Right Column */}
                                        <Box style={{ flex: 1 }}>
                                            <DataList.Root>
                                                <DataList.Item>
                                                    <DataList.Label minWidth="88px">Gender</DataList.Label>
                                                    <DataList.Value>{wardenData.gender || 'Not specified'}</DataList.Value>
                                                </DataList.Item>

                                                <DataList.Item>
                                                    <DataList.Label minWidth="88px">Hostel</DataList.Label>
                                                    <DataList.Value>{wardenData.hostel || 'No hostel assigned'}</DataList.Value>
                                                </DataList.Item>

                                                <DataList.Item>
                                                    <DataList.Label minWidth="88px">Joined</DataList.Label>
                                                    <DataList.Value>{formatDate(wardenData.created_at)}</DataList.Value>
                                                </DataList.Item>
                                            </DataList.Root>
                                        </Box>
                                    </Flex>
                                </Flex>
                            </Box>
                        </Card>
                    </Box>
                </Flex>
            </Box>

            {/* Edit Profile Dialog */}
            <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <Dialog.Content style={{ maxWidth: 500 }}>
                    <Dialog.Title>Edit Profile</Dialog.Title>


                    <Flex direction="column" gap="4">
                        {/* Profile Picture Section */}
                        <Flex direction="column" gap="2" align="center">
                            <Box style={{ position: 'relative' }}>
                                <Avatar
                                    size="6"
                                    src={profileImage ? URL.createObjectURL(profileImage) : wardenData?.profile_pic}
                                    fallback={wardenData?.name?.charAt(0) || 'W'}
                                    radius="full"
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleAvatarClick}
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </Box>
                            <Text size="2" weight="medium">Profile Picture</Text>
                        </Flex>


                        {/* Email Field */}
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Email</Text>
                            <TextField.Root
                                value={editData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter email address"
                            />
                        </Flex>

                        {/* Phone Field */}
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Phone</Text>
                            <TextField.Root
                                value={editData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </Flex>

                        {/* Gender Field */}
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Gender</Text>
                            {console.log('Rendering SegmentedControl with selectedGender:', selectedGender)}
                            <SegmentedControl.Root
                                value={selectedGender}
                                onValueChange={(value) => {
                                    console.log('SegmentedControl changed to:', value);
                                    setSelectedGender(value);
                                    handleInputChange('gender', value);
                                }}
                                radius="medium"
                                style={{ cursor: 'pointer' }}
                            >
                                <SegmentedControl.Item value="male" style={{ cursor: 'pointer' }}>Male</SegmentedControl.Item>
                                <SegmentedControl.Item value="female" style={{ cursor: 'pointer' }}>Female</SegmentedControl.Item>
                                <SegmentedControl.Item value="other" style={{ cursor: 'pointer' }}>Other</SegmentedControl.Item>
                            </SegmentedControl.Root>
                        </Flex>
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>
                                Cancel
                            </Button>
                        </Dialog.Close>
                        <Button 
                            onClick={handleSave} 
                            style={{ cursor: 'pointer' }}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Flex align="center" gap="2">
                                    <Spinner size="1" />
                                    Saving...
                                </Flex>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            {/* Change Password Dialog */}
            <Dialog.Root open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                <Dialog.Content style={{ maxWidth: 500 }}>
                    <Dialog.Title>Change Password</Dialog.Title>

                    <Flex direction="column" gap="4">
                        {/* Current Password Field */}
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Current Password</Text>
                            <TextField.Root
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                placeholder="Enter current password"
                            />
                        </Flex>

                        {/* New Password Field */}
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">New Password</Text>
                            <TextField.Root
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                placeholder="Enter new password"
                            />
                        </Flex>

                        {/* Confirm Password Field */}
                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium">Confirm New Password</Text>
                            <TextField.Root
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </Flex>
                    </Flex>

                    <Flex gap="3" mt="4" justify="between" align="center">
                        <Badge color="gray" variant="soft" size="2">
                            Forgot password? Contact admin
                        </Badge>
                        <Flex gap="3">
                            <Dialog.Close>
                                <Button variant="soft" color="gray" style={{ cursor: 'pointer' }} onClick={handleCancelPasswordChange}>
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button 
                                onClick={handleChangePassword} 
                                style={{ cursor: 'pointer' }}
                                disabled={isChangingPassword}
                                color="indigo"
                            >
                                {isChangingPassword ? (
                                    <Flex align="center" gap="2">
                                        <Spinner size="1" />
                                        Changing...
                                    </Flex>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </Flex>
    );
};

export default Profile;
