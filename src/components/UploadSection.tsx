import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface UploadSectionProps {
    onFileSelected: (file: File) => void;
    className?: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelected, className }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelected(acceptedFiles[0]);
        }
    }, [onFileSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/*': ['.mp4', '.mov', '.avi']
        },
        maxFiles: 1
    });

    return (
        <div
            {...getRootProps()}
            className={twMerge(
                clsx(
                    "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200",
                    "hover:border-primary hover:bg-white/5",
                    isDragActive ? "border-primary bg-primary/10" : "border-gray-600",
                    className
                )
            )}
        >
            <input {...getInputProps()} />
            <div className="bg-gray-800 p-4 rounded-full mb-4">
                {isDragActive ? (
                    <FileVideo className="w-8 h-8 text-primary" />
                ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
                {isDragActive ? "Drop the video here" : "Upload your running video"}
            </h3>
            <p className="text-gray-400 text-center max-w-sm">
                Drag and drop a video file here, or click to select format (MP4, MOV)
            </p>
        </div>
    );
};
