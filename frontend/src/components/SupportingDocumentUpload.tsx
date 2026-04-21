import React, { useRef, useState } from 'react';

interface SupportingDocumentUploadProps {
    selectedFile: File | null;
    onFileSelected: (file: File | null) => void;
    currentFileName?: string;
    accept?: string;
    title?: string;
    subtitle?: string;
}

const SupportingDocumentUpload: React.FC<SupportingDocumentUploadProps> = ({
    selectedFile,
    onFileSelected,
    currentFileName,
    accept = '.pdf,application/pdf',
    title = 'Drag and drop file here',
    subtitle = 'or click to browse'
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0] || null;
        onFileSelected(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    return (
        <div
            className={`transaction-upload-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                }
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="transaction-upload-file-input"
                onChange={e => onFileSelected(e.target.files?.[0] || null)}
                accept={accept}
            />
            <svg
                className="transaction-upload-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M7 18a4 4 0 0 1-.7-7.94A5.5 5.5 0 0 1 17 9.5h.5a3.5 3.5 0 1 1 0 7H15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 18V11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M9.5 13.5 12 11l2.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <p className="transaction-upload-title">{title}</p>
            <p className="transaction-upload-subtitle">{subtitle}</p>
            {selectedFile ? (
                <p className="transaction-upload-filename">
                    Selected: {selectedFile.name}
                </p>
            ) : currentFileName ? (
                <p className="transaction-upload-filename">
                    Current: {currentFileName}
                </p>
            ) : null}
        </div>
    );
};

export default SupportingDocumentUpload;
