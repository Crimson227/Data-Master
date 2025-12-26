export const ModelType = {
  LINEAR_REGRESSION: 'Linear Regression',
  DECISION_TREE: 'Decision Tree',
  RANDOM_FOREST: 'Random Forest',
  SVR: 'SVR'
} as const;

export type ModelType = typeof ModelType[keyof typeof ModelType];

export interface TrainingMetrics {
  r2: number;
  rmse: number;
  mae: number;
}

export interface DataPreview {
  columns: string[];
  rows: any[][];
  total_rows: number;
  means: Record<string, number>;
}

export interface ThemeColor {
  name: string;
  hex: string;
}

export interface AppState {
  modelType: ModelType;
  themeColor: string;
  paginationSize: number;
  isModelTrained: boolean;
  trainingMetrics: TrainingMetrics | null;
  dataLoaded: boolean;
  activePage: 'workflow' | 'docs' | 'settings';
}