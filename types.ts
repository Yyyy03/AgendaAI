export interface AgendaItem {
  id: string;
  topic: string;
  durationMinutes: number;
  startTime?: string;
  description: string;
  speaker?: string;
}

export interface Stakeholder {
  name: string;
  role: string;
  relevance: string;
}

export interface AnalysisResult {
  title: string;
  summary: string;
  date: string;
  stakeholders: Stakeholder[];
  agenda: AgendaItem[];
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  data: string; // Base64
  mimeType: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
}