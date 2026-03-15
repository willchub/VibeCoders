import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadListingImage } from '../services/api';

const ImageDropzone = ({ value, onChange, userId, disabled = false, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Please choose an image file (e.g. JPG, PNG).');
      return;
    }
    if (!userId) {
      setUploadError('You must be signed in to upload an image.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadListingImage(file, userId);
      onChange(url);
    } catch (err) {
      setUploadError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const openPicker = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  const removeImage = (e) => {
    e.stopPropagation();
    onChange('');
    setUploadError('');
  };

  const showPreview = value && !uploading;

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={onInputChange}
        className="hidden"
        aria-hidden="true"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => e.key === 'Enter' && openPicker()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        aria-label="Upload listing image"
        className={`
          relative min-h-[200px] rounded-xl border-2 border-dashed transition-colors
          flex items-center justify-center overflow-hidden
          ${disabled || uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
          ${isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/50'}
        `}
      >
        {showPreview ? (
          <>
            <img
              src={value}
              alt="Listing preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-4 py-6">
            {uploading ? (
              <span className="text-brand-secondary font-medium">Uploading…</span>
            ) : (
              <>
                <Upload className="h-10 w-10 text-brand-muted" />
                <span className="text-brand-secondary font-medium">
                  Drop an image here or click to choose
                </span>
                <span className="text-xs text-brand-muted">JPG, PNG, GIF or WebP</span>
              </>
            )}
          </div>
        )}
      </div>
      {uploadError && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {uploadError}
        </p>
      )}
      {!value && !uploadError && (
        <p className="mt-1 text-xs text-brand-muted">Optional. Leave empty for a default image.</p>
      )}
    </div>
  );
};

export default ImageDropzone;
