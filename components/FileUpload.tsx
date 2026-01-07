import React, { useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void;
  currentFile: UploadedFile | null;
  onClearFile: () => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, currentFile, onClearFile, isProcessing }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const uploadedFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64String,
        mimeType: file.type || 'application/octet-stream',
      };
      onFileUpload(uploadedFile);
    };
    reader.readAsDataURL(file);
  }, [onFileUpload]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50 border-r border-slate-200 w-80 shrink-0">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <FileText size={18} />
          </div>
          AgendaAI
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Upload a document to generate a meeting timeline.
        </p>
      </div>

      <div className="flex-1">
        {!currentFile ? (
          <div className="h-48 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 hover:border-indigo-400 transition-colors flex flex-col items-center justify-center p-4 text-center cursor-pointer relative group">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.md,image/*,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isProcessing}
            />
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={20} />
            </div>
            <p className="text-sm font-medium text-slate-700">Click to upload</p>
            <p className="text-xs text-slate-400 mt-1">PDF, TXT, MD, Images</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
             {isProcessing && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                     <div className="flex flex-col items-center">
                         <Loader2 className="animate-spin text-indigo-600 mb-2" size={24}/>
                         <span className="text-xs font-medium text-indigo-600">Analyzing...</span>
                     </div>
                 </div>
             )}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {currentFile.name}
                  </p>
                  <p className="text-xs text-slate-500">{formatSize(currentFile.size)}</p>
                </div>
              </div>
              <button
                onClick={onClearFile}
                disabled={isProcessing}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <div className="flex-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md text-center font-medium">
                    Analyzed
                </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="bg-slate-100 rounded-lg p-3">
             <p className="text-xs text-slate-500 font-medium mb-1">Tips</p>
             <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                 <li>Upload project specs</li>
                 <li>Upload strategy docs</li>
                 <li>Supports PDF & Text</li>
             </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;