# Package Image Upload Feature

## Overview
Admins can now upload package images directly from their computer instead of providing external URLs.

## Backend Changes

### 1. New Upload Endpoint
- **Endpoint:** `POST /api/admin/packages/upload-image`
- **Authentication:** ADMIN only
- **Content-Type:** `multipart/form-data`

### 2. File Upload Validation
- **Allowed Types:** JPG, JPEG, PNG, GIF, WEBP
- **Max Size:** 5MB
- **Storage Location:** `BACKEND/public/uploads/packages/`

### 3. Response Format
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "image_url": "/uploads/packages/pkg_1234567890_filename.jpg",
    "file_name": "pkg_1234567890_filename.jpg",
    "file_size": 102400,
    "mime_type": "image/jpeg"
  }
}
```

## Frontend Changes (Admin)

### 1. New File Input
- Replaced URL text input with file upload button
- Shows image preview before upload
- Displays file name and size

### 2. Upload Flow
1. Admin clicks "Choose Image" button
2. Selects image file from computer
3. Preview appears in modal
4. On "Save", image is uploaded first
5. Returned URL is saved with package data

## Frontend Changes (Customer)

### Image Display
- Customer frontend automatically prepends `IMAGE_BASE` to image URLs
- Format: `http://localhost/Sam-Backend/BACKEND/public/` + `/uploads/packages/filename.jpg`
- Fallback to placeholder image if upload fails

## Usage Instructions

### For Admins:
1. Navigate to **Packages** page
2. Click **Create Package** or **Edit** on existing package
3. In the modal, click **"Choose Image"** button
4. Select an image file from your computer
5. Preview will appear automatically
6. Fill in other package details
7. Click **Save**

### Supported Image Formats:
- ✅ JPG / JPEG
- ✅ PNG
- ✅ GIF
- ✅ WEBP

### Image Requirements:
- Maximum file size: 5MB
- Recommended dimensions: 800x600 pixels or higher
- Square or landscape orientation works best

## Folder Structure
```
BACKEND/
└── public/
    └── uploads/
        ├── .htaccess          (CORS configuration)
        └── packages/          (Package images stored here)
            ├── pkg_123456_image1.jpg
            ├── pkg_789012_image2.png
            └── ...
```

## API Integration

### Step 1: Upload Image
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch(API_BASE_URL + '/admin/packages/upload-image', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    body: formData
});

const result = await response.json();
const imageUrl = result.data.image_url; // e.g., "/uploads/packages/pkg_123.jpg"
```

### Step 2: Save Package with Image URL
```javascript
const packageData = {
    package_name: "Bridal Package",
    description: "Complete bridal makeover",
    total_price: 15000,
    validity_days: 90,
    image_url: imageUrl, // Use uploaded URL
    status: "ACTIVE",
    service_ids: [1, 2, 3]
};

await PackagesAPI.create(packageData);
```

## Troubleshooting

### Images Not Displaying?
1. Check if file exists in `BACKEND/public/uploads/packages/`
2. Verify `IMAGE_BASE` URL in customer frontend config
3. Check browser console for 404 errors
4. Ensure `.htaccess` file exists in uploads folder

### Upload Fails?
1. Check file size (must be < 5MB)
2. Verify file type (JPG, PNG, GIF, WEBP only)
3. Ensure `uploads/packages` folder has write permissions (0777)
4. Check PHP `upload_max_filesize` in php.ini

### Permission Issues (Linux/Mac)
```bash
chmod -R 777 BACKEND/public/uploads/
chown -R www-data:www-data BACKEND/public/uploads/
```

## Security Notes
- ✅ File type validation using MIME type detection
- ✅ File size limit enforced (5MB)
- ✅ Unique filenames generated (prevents overwriting)
- ✅ Files stored outside web root would be ideal (future improvement)
- ⚠️ Consider adding image dimension validation
- ⚠️ Consider adding virus scanning for production

## Future Enhancements
- [ ] Image compression/resizing on upload
- [ ] Multiple images per package
- [ ] Image cropping tool
- [ ] CDN integration for production
- [ ] Lazy loading for better performance
