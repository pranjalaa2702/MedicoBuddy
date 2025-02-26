import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import { Camera, Upload, RefreshCw } from 'lucide-react';

interface PrescriptionScannerProps {
  onScan: (image: string) => void;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({ onScan }) => {
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const webcamRef = React.useRef<Webcam>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      onScan(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [onScan]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onScan(imageSrc);
      setIsUsingCamera(false);
    }
  }, [onScan]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isUsingCamera ? (
        <div className="relative">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg shadow-lg"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-4">
            <button
              onClick={capture}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              Capture
            </button>
            <button
              onClick={() => setIsUsingCamera(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag & drop a prescription image here, or click to select
            </p>
          </div>
          
          <button
            onClick={() => setIsUsingCamera(true)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Camera className="h-5 w-5" />
            Use Camera
          </button>
        </div>
      )}
    </div>
  );
};