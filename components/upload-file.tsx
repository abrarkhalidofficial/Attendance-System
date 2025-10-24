'use client';

import React, { useState, ChangeEvent, DragEvent } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface ExistingFile {
  name: string;
  url?: string;
  id?: string | number;
}

interface FileUploadComponentProps {
  multiple?: boolean;
  existingFiles?: ExistingFile[];
  onExistingFileRemove?: (file: ExistingFile, index: number) => void;
  onFilesChange?: (files: File[]) => void;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  dragDropText?: string;
  addMoreText?: string;
}

export default function FileUpload({
  multiple = false,
  existingFiles = [],
  onExistingFileRemove,
  onFilesChange,
  acceptedFileTypes,
  dragDropText = 'Drag and drop files here or click to browse',
  addMoreText = 'Add More Files',
}: FileUploadComponentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      let updatedFiles: File[];

      if (multiple) {
        updatedFiles = [...files, ...newFiles];
      } else {
        updatedFiles = newFiles.slice(0, 1);
      }

      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    let updatedFiles: File[];

    if (multiple) {
      updatedFiles = [...files, ...newFiles];
    } else {
      updatedFiles = newFiles.slice(0, 1);
    }

    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const removeFile = (index: number): void => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const removeExistingFile = (index: number): void => {
    if (onExistingFileRemove && existingFiles[index]) {
      onExistingFileRemove(existingFiles[index], index);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasContent = files.length > 0 || existingFiles.length > 0;
  const canAddMore = multiple || (!multiple && files.length === 0 && existingFiles.length === 0);
  const acceptAttribute = acceptedFileTypes?.join(',');

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <div
          className={`relative cursor-pointer border-2 border-dashed border-spacing-2 rounded-lg p-12 transition-colors dark:bg-muted ${
            isDragging ? 'border-[#373CA3] bg-blue-50' : hasContent ? 'border-gray-300 bg-white ' : 'border-[#373CA3] bg-gray-50 '
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!hasContent ? (
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.50318 8.50195H5.59338C3.60897 8.50195 2 10.0813 2 12.0292V16.6955C2 18.6425 3.60897 20.2219 5.59338 20.2219H16.4467C18.4311 20.2219 20.04 18.6425 20.04 16.6955V12.0196C20.04 10.0775 18.4359 8.50195 16.4574 8.50195H15.5378"
                  stroke="#373CA3"
                  strokeWidth={2.23743}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M11.0161 2V13.5257" stroke="#373CA3" strokeWidth={2.23743} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.17285 4.80268L11.0154 2L13.8589 4.80268" stroke="#373CA3" strokeWidth={2.23743} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[#373CA3] font-medium mb-1">{dragDropText}</p>
              {!multiple && <p className="text-xs text-gray-500">Single file only</p>}
              <label htmlFor="file-input" className="h-full w-full absolute top-0 left-0 cursor-pointer" />
              <input type="file" multiple={multiple} onChange={handleFileChange} className="hidden" id="file-input" accept={acceptAttribute} />
            </div>
          ) : (
            <div className="space-y-3">
              {existingFiles.map((file, index) => (
                <div
                  key={`existing-${file.id || index}`}
                  className="flex items-center justify-between bg-white dark:bg-muted border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-[#373CA3] flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate font-medium">{file.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">(existing)</span>
                  </div>
                  <button onClick={() => removeExistingFile(index)} className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" aria-label="Remove file" type="button">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}

              {files.map((file, index) => (
                <div key={`file-${index}`} className="flex items-center justify-between bg-white border dark:bg-muted border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-[#373CA3] flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-gray-700 dark:text-white truncate font-medium">{file.name}</span>
                      <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFile(index)} className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" aria-label="Remove file" type="button">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}

              {canAddMore && (
                <div className="pt-2">
                  <input type="file" multiple={multiple} onChange={handleFileChange} className="hidden" id="file-input-more" accept={acceptAttribute} />
                  <label
                    htmlFor="file-input-more"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#373CA3] text-white rounded-md hover:bg-[#373CA3]/90 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {multiple ? addMoreText : 'Replace File'}
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
