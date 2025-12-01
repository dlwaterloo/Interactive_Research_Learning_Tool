import { 
  Crown, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  BarChart3, 
  Type 
} from 'lucide-react';

export const NODE_THEMES = {
  thesis: { id: 'thesis', color: '#FF6FAE', label: 'Central Thesis', icon: Crown },
  evidence: { id: 'evidence', color: '#FACC15', label: 'Supporting Evidence', icon: FileText },
  counter: { id: 'counter', color: '#ef4444', label: 'Counter Argument', icon: AlertTriangle },
  insight: { id: 'insight', color: '#8A5EFD', label: 'AI Insight', icon: Sparkles },
  data: { id: 'data', color: '#10b981', label: 'Data Point', icon: BarChart3 },
  default: { id: 'default', color: '#64748b', label: 'Note', icon: FileText },
  heading: { id: 'heading', color: '#ffffff', label: 'Heading', icon: Type }
};

