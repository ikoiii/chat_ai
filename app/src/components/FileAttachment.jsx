import { useState, useRef } from "react";
import { Paperclip, X, File, Image, FileText, Download, Eye } from "lucide-react";

export default function FileAttachment({ onFileSelect, disabled = false, maxSize = 10 * 1024 * 1024 }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return false;
    }

    // Allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'text/markdown',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json', 'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported');
      return false;
    }

    return true;
  };

  const handleFiles = (newFiles) => {
    setError("");
    const validFiles = [];

    for (const file of newFiles) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFileSelect?.(updatedFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(Array.from(droppedFiles));
    }
  };

  const handleFileInput = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(Array.from(selectedFiles));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onFileSelect?.(updatedFiles);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return Image;
    } else if (file.type.includes('text') || file.type.includes('markdown')) {
      return FileText;
    } else {
      return File;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const previewFile = (file) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else {
      // For non-image files, we could implement a preview modal
      alert(`Preview for ${file.name} not available in this demo`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          accept="image/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.json,.csv"
        />

        <div className="text-center">
          <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {dragActive ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Max size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Attached Files ({files.length})
          </div>
          {files.map((file, index) => {
            const Icon = getFileIcon(file);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
              >
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => previewFile(file)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}