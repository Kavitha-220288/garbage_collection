import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DataOrigin = 'REAL' | 'SIMULATED' | 'PREDICTED';

export interface ProvenanceMetadata {
  origin: DataOrigin;
  confidence?: number;
  modelVersion?: string;
  generatedAt?: string;
  sourceSystem?: string;
}
