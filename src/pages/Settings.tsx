import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { ModelType } from '../types';
import type { AppState } from '../types';
import { THEME_COLORS, MODEL_OPTIONS, MODEL_NAME_MAPPING } from '../constants';
import {
  Monitor,
  Database,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  XCircle,
  Info,
  LayoutList,
  Palette,
  ArrowRight
} from 'lucide-react';

interface SettingsProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const Settings: React.FC<SettingsProps> = ({ appState, setAppState }) => {

  const handleThemeChange = (color: string) => {
    setAppState(prev => ({ ...prev, themeColor: color }));
    document.documentElement.style.setProperty('--color-primary', color);
  };

  const handleModelChange = (model: ModelType) => {
    setAppState(prev => ({
      ...prev,
      modelType: model,
      isModelTrained: false,
      trainingMetrics: null
    }));
  };

  const handlePaginationChange = (size: number) => {
    setAppState(prev => ({ ...prev, paginationSize: size }));
  };

  // Helper to render status steps
  const StatusStep = ({
    label,
    active,
    completed,
    isLast = false
  }: { label: string, active: boolean, completed: boolean, isLast?: boolean }) => (
    <div className="flex items-center flex-1 last:flex-none">
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black font-bold text-xs transition-all
        ${completed ? 'bg-green-400 text-black shadow-pop-sm' : active ? 'bg-yellow-300 text-black shadow-pop-sm' : 'bg-slate-100 text-slate-400'}
      `}>
        {completed ? <CheckCircle2 size={14} /> : active ? <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <XCircle size={14} />}
        {label}
      </div>
      {!isLast && (
        <div className={`h-0.5 flex-1 mx-2 border-t-2 border-dashed ${completed ? 'border-black' : 'border-slate-300'}`} />
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-black text-white -rotate-2 shadow-pop-sm">
          <Cpu size={28} />
        </div>
        <h1 className="text-4xl font-display font-black text-slate-900 uppercase">系统配置</h1>
      </div>

      {/* M1: Current System Status (P3-M1) */}
      <GlassCard title="M1. 当前系统状态">
        <div className="space-y-6">
          {/* Pipeline Status */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">当前步骤</label>
            <div className="flex justify-between items-center w-full bg-white p-4 border-2 border-black shadow-pop-sm rounded-xl">
              <StatusStep
                label="数据上传"
                completed={appState.dataLoaded}
                active={!appState.dataLoaded}
              />
              <StatusStep
                label="模型训练"
                completed={appState.isModelTrained}
                active={appState.dataLoaded && !appState.isModelTrained}
              />
              <StatusStep
                label="预测分析"
                completed={false} // Prediction is an action, usually not a permanent state, but we can imply readiness
                active={appState.isModelTrained}
                isLast
              />
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 border-2 border-black flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">数据源状态</span>
              <span className={`text-xs font-black px-2 py-1 border border-black ${appState.dataLoaded ? 'bg-green-400' : 'bg-slate-200'}`}>
                {appState.dataLoaded ? '✔ 已就绪' : '✘ 未加载'}
              </span>
            </div>
            <div className="bg-slate-50 p-4 border-2 border-black flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">当前模型内核</span>
              <div className="text-right">
                <span className="block text-xs font-black uppercase text-primary">
                  {MODEL_NAME_MAPPING[appState.modelType] || appState.modelType}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">(默认)</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* M2: Default Behavior Rules (P3-M2) */}
      <GlassCard title="M2. 默认行为说明" className="bg-yellow-50">
        <div className="flex gap-4 items-start">
          <Info className="text-black shrink-0 mt-1" />
          <div className="space-y-2">
            {[
              "每次上传数据会覆盖旧数据，系统不保留历史版本。",
              "模型训练总是基于当前最新加载的数据集。",
              "预测结果来自最近一次训练完成的模型参数。"
            ].map((rule, i) => (
              <p key={i} className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full" /> {rule}
              </p>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* M3: Display & Experience Settings (P3-M3) */}
      <GlassCard title="M3. 显示与体验设置">
        <div className="space-y-8">

          {/* Pagination Size (New) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutList size={18} />
              <label className="text-black text-sm font-black uppercase tracking-wide">表格每页显示行数</label>
            </div>
            <div className="flex gap-3">
              {[10, 20, 50].map(size => (
                <button
                  key={size}
                  onClick={() => handlePaginationChange(size)}
                  className={`
                     flex-1 py-3 border-2 border-black font-bold font-mono text-sm transition-all
                     ${appState.paginationSize === size
                      ? 'bg-black text-white shadow-pop-sm -translate-y-1'
                      : 'bg-white text-slate-600 hover:bg-slate-50'}
                   `}
                >
                  {size} 行
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-200 border-t border-dashed border-slate-300" />

          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={18} />
              <label className="text-black text-sm font-black uppercase tracking-wide">界面强调色</label>
            </div>
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map(color => (
                <button
                  key={color.hex}
                  onClick={() => handleThemeChange(color.hex)}
                  className={`w-10 h-10 border-2 border-black transition-transform hover:scale-110 shadow-pop-sm ${appState.themeColor === color.hex ? 'scale-110 ring-2 ring-offset-2 ring-black' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-200 border-t border-dashed border-slate-300" />

          {/* Model Algorithm (Kept here for functionality) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={18} />
              <label className="text-black text-sm font-black uppercase tracking-wide">算法内核配置</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              {MODEL_OPTIONS.map(m => (
                <button
                  key={m}
                  onClick={() => handleModelChange(m)}
                  className={`px-3 py-3 border-2 border-black text-xs font-bold transition-all text-left flex items-center justify-between ${appState.modelType === m
                    ? 'bg-black text-white shadow-pop-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <span>{MODEL_NAME_MAPPING[m]}</span>
                  {appState.modelType === m && <CheckCircle2 size={14} className="text-green-400" />}
                </button>
              ))}
            </div>
          </div>

        </div>
      </GlassCard>

      {/* M4: About (P3-M4) */}
      <div className="border-t-4 border-black pt-8 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-display font-black text-2xl uppercase">DataMaster</h4>
            <p className="font-mono text-xs font-bold text-slate-400 mt-1">数据分析与统计</p>
          </div>

          <div className="bg-yellow-100 border-2 border-black p-3 md:p-4 shadow-pop-sm max-w-md">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-black shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  免责声明：本系统提供的所有预测结果仅供参考，不构成任何投资建议或决策依据。使用本系统即代表您同意自行承担数据分析产生的所有风险。
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] font-bold text-slate-300 mt-8 uppercase tracking-widest">
          Designed by 0234163 胡圣哲
        </p>
      </div>
    </div>
  );
};