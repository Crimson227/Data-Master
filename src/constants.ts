import { ModelType } from './types';
import type { ThemeColor } from './types';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react';

export const API_BASE_URL = 'http://localhost:8000';

export const THEME_COLORS: ThemeColor[] = [
  { name: '电光蓝', hex: '#3b82f6' },
  { name: '热烈粉', hex: '#db2777' },
  { name: '鲜艳紫', hex: '#9333ea' },
  { name: '活力橙', hex: '#f97316' },
  { name: '青柠绿', hex: '#65a30d' },
  { name: '波普青', hex: '#0891b2' },
  { name: '复古红', hex: '#e11d48' },
  { name: '极致黑', hex: '#0f172a' },
];

export const MODEL_OPTIONS = [
  ModelType.LINEAR_REGRESSION,
  ModelType.DECISION_TREE,
  ModelType.RANDOM_FOREST,
  ModelType.SVR
];

export const MODEL_NAME_MAPPING: Record<string, string> = {
  [ModelType.LINEAR_REGRESSION]: '线性回归',
  [ModelType.DECISION_TREE]: '决策树',
  [ModelType.RANDOM_FOREST]: '随机森林',
  [ModelType.SVR]: '支持向量机 (SVR)'
};

export const NAV_ITEMS = [
  { id: 'workflow', label: '工作台', icon: LayoutDashboard },
  { id: 'docs', label: '使用手册', icon: BookOpen },
  { id: 'settings', label: '系统设置', icon: Settings },
] as const;