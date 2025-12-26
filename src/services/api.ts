import { API_BASE_URL } from '../constants';
import type { DataPreview, TrainingMetrics } from '../types';

export const api = {
  uploadCSV: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
  },

  trainModel: async (modelType: string): Promise<TrainingMetrics> => {
    const response = await fetch(`${API_BASE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_type: modelType }),
    });
    if (!response.ok) throw new Error('Training failed');
    return response.json();
  },

  getDataPreview: async (): Promise<DataPreview> => {
    // We try to fetch as many rows as possible to support client-side pagination
    // Aggressively try every common pagination parameter convention
    const params = new URLSearchParams({
      limit: '1000',
      n: '1000',
      size: '1000',
      rows: '1000',
      per_page: '1000',
      page_size: '1000',
      count: '1000',
      _t: new Date().getTime().toString() // Cache buster
    });

    const response = await fetch(`${API_BASE_URL}/data?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  },

  predict: async (features: Record<string, number>): Promise<{ prediction: number }> => {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });
    if (!response.ok) throw new Error('Prediction failed');
    return response.json();
  },
};