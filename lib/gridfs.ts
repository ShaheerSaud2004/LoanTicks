/**
 * MongoDB GridFS utility for storing and retrieving documents
 * GridFS is perfect for storing files in MongoDB, especially for production
 */

import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

let gridFSBucket: GridFSBucket | null = null;

export function getGridFSBucket(): GridFSBucket {
  if (!gridFSBucket && mongoose.connection.db) {
    gridFSBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'documents',
    });
  }
  if (!gridFSBucket) {
    throw new Error('MongoDB connection not established. Call connectDB() first.');
  }
  return gridFSBucket;
}

/**
 * Upload a file to GridFS
 * Returns the file ID that can be used to retrieve the file later
 */
export async function uploadFileToGridFS(
  buffer: Buffer,
  filename: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  const bucket = getGridFSBucket();
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: metadata || {},
    });

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(buffer);
  });
}

/**
 * Download a file from GridFS by file ID
 */
export async function downloadFileFromGridFS(fileId: string): Promise<Buffer> {
  const bucket = getGridFSBucket();
  const objectId = new ObjectId(fileId);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(objectId);

    downloadStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', (error) => {
      reject(error);
    });

    downloadStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

/**
 * Delete a file from GridFS by file ID
 */
export async function deleteFileFromGridFS(fileId: string): Promise<void> {
  const bucket = getGridFSBucket();
  const objectId = new ObjectId(fileId);
  
  return new Promise((resolve, reject) => {
    bucket.delete(objectId).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}

/**
 * Get file metadata from GridFS
 */
export async function getFileMetadata(fileId: string): Promise<{
  filename: string;
  length: number;
  contentType?: string;
  uploadDate: Date;
  metadata?: Record<string, unknown>;
}> {
  const bucket = getGridFSBucket();
  const objectId = new ObjectId(fileId);
  
  const files = await bucket.find({ _id: objectId }).toArray();
  
  if (files.length === 0) {
    throw new Error('File not found');
  }
  
  const file = files[0];
  return {
    filename: file.filename,
    length: file.length,
    contentType: file.contentType,
    uploadDate: file.uploadDate,
    metadata: file.metadata as Record<string, unknown> | undefined,
  };
}
