import React, { useState } from 'react';
import { Layout, Calendar, Users, FileText, CheckCircle2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Timeline from './components/Timeline';
import ChatBot from './components/ChatBot';
import { UploadedFile, AnalysisResult } from './types';
import { generateAgendaFromDoc } from './services/geminiService';

const App: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: UploadedFile) => {
    setCurrentFile(file);
    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await generateAgendaFromDoc(file.data, file.mimeType);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the document. Please try a different file or ensure it contains readable text.");
      setCurrentFile(null); // Reset on error so user can try again easily
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setCurrentFile(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <FileUpload 
        onFileUpload={handleFileUpload} 
        currentFile={currentFile} 
        onClearFile={clearFile}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white relative">
        <div className="max-w-4xl mx-auto px-8 py-10">
          
          {/* Header Area */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meeting Agenda Builder</h1>
            <p className="text-slate-500 mt-2">
              Transform your documents into structured timelines and actionable items.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isProcessing && (
             <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Layout className="text-indigo-600 animate-spin-slow" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-800">Generating Agenda...</h3>
                <p className="text-slate-500 text-sm mt-1">Reading document, identifying stakeholders, and calculating durations.</p>
             </div>
          )}

          {/* Empty State */}
          {!currentFile && !isProcessing && !error && (
            <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50/50">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4 text-slate-300">
                  <Calendar size={32} />
               </div>
               <h3 className="text-lg font-medium text-slate-900">No Document Selected</h3>
               <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                 Upload a project brief, email thread, or report on the left to instantly create a meeting plan.
               </p>
            </div>
          )}

          {/* Results Area */}
          {analysisResult && (
            <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500 fade-in">
              
              {/* Meeting Header Card */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <div className="text-indigo-600 text-sm font-bold uppercase tracking-wide mb-1">Proposed Meeting</div>
                        <h2 className="text-2xl font-bold text-slate-900">{analysisResult.title}</h2>
                        <p className="text-slate-600 mt-2 leading-relaxed">{analysisResult.summary}</p>
                    </div>
                    <div className="bg-white/60 px-4 py-2 rounded-lg text-slate-700 font-medium text-sm border border-indigo-100/50 shadow-sm backdrop-blur-sm">
                        {analysisResult.date}
                    </div>
                 </div>
              </div>

              {/* Stakeholders Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                    <Users className="text-slate-400" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Key Stakeholders</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.stakeholders.map((stakeholder, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:border-indigo-200 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 font-bold text-sm">
                                {stakeholder.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">{stakeholder.name}</h4>
                                <div className="text-xs font-medium text-indigo-600 mb-1">{stakeholder.role}</div>
                                <p className="text-xs text-slate-500 leading-snug">{stakeholder.relevance}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </section>

              {/* Agenda Timeline Section */}
              <section className="relative">
                <div className="flex items-center gap-2 mb-6">
                    <CheckCircle2 className="text-slate-400" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Timeline Agenda</h3>
                </div>
                <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
                    <Timeline items={analysisResult.agenda} />
                </div>
              </section>

            </div>
          )}
        </div>
      </main>

      {/* Chat Bot Overlay */}
      <ChatBot file={currentFile} analysis={analysisResult} />
    </div>
  );
};

export default App;