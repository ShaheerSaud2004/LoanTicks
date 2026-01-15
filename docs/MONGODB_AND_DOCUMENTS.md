# MongoDB Connection & Document Upload

## ✅ MongoDB Connection Status

**Status:** ✓ Working

The MongoDB connection has been tested and is functioning correctly.

**Test Endpoint:** `GET /api/test-mongodb`

**Current Status:**
- Connection: Successful
- Users in Database: 6
- Connection Method: Mongoose with connection caching

## 📄 Document Upload System

### Features Implemented

1. **File Storage**
   - Documents are saved to `public/uploads/{applicationId}/`
   - Files are stored with unique timestamps to avoid conflicts
   - Original filenames are preserved in metadata

2. **File Validation**
   - Maximum file size: 10MB per file
   - Allowed file types: PDF, JPG, JPEG, PNG
   - File type and size validation before upload

3. **Document Collection in Form**
   - All uploaded documents are collected in `uploadedDocuments` array
   - Duplicate prevention (checks by name and size)
   - Documents can be removed before submission
   - Visual summary shows all uploaded files

4. **Upload Process**
   - Documents are uploaded after application submission
   - Files are associated with the application ID
   - Metadata stored in MongoDB (name, size, type, URL, upload date)
   - Error handling with user-friendly messages

### Document Types

**Required Documents:**
- Government-Issued ID (Driver's License, Passport, or State ID)
- Pay Stubs (last 2-3 months, or tax returns for self-employed)

**Optional Documents:**
- Bank statements
- Tax returns
- W-2s
- Other financial documents

### API Endpoints

**Upload Documents:**
- `POST /api/upload-documents`
- Requires: `applicationId` and `files` (multipart/form-data)
- Returns: Upload confirmation with document metadata

**Test MongoDB:**
- `GET /api/test-mongodb`
- Returns: Connection status and user count

### File Storage Location

```
public/
└── uploads/
    └── {applicationId}/
        └── {timestamp}_{filename}
```

Files are accessible via: `/uploads/{applicationId}/{filename}`

### Security Features

- ✅ User authentication required
- ✅ User can only upload to their own applications
- ✅ File type validation
- ✅ File size limits
- ✅ Sanitized filenames
- ✅ Application ownership verification

### Usage

1. **In Form:**
   - Upload documents in the "Supporting Documents" section (Step 14)
   - Required documents (ID and Pay Stubs) must be uploaded
   - Additional documents are optional
   - All documents are collected in the form state

2. **On Submission:**
   - Documents are automatically uploaded after application is created
   - Upload happens in the background
   - User receives confirmation or error messages

3. **Viewing Documents:**
   - Documents are stored with the application
   - Can be viewed by employees/admins in the application review
