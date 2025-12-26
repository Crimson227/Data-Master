import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BrainCircuit, Zap, ArrowRight, Activity, Sparkles, AlertCircle, FileSpreadsheet, RefreshCw, ChevronLeft, ChevronRight, Hash, Star, Cpu, ScanLine } from 'lucide-react';
import confetti from 'canvas-confetti';
import CountUp from 'react-countup';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';
import type { AppState, DataPreview } from '../types';
import { MODEL_NAME_MAPPING } from '../constants';

interface WorkflowProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const Workflow: React.FC<WorkflowProps> = ({ appState, setAppState }) => {
  const [loading, setLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false); // Specific state for training visual
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [features, setFeatures] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = appState.paginationSize; // Default now 50 from App.tsx

  useEffect(() => {
    if (appState.dataLoaded) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getDataPreview();
      setDataPreview(data);
      // Reset to page 1 on new data
      setCurrentPage(1);

      if (Object.keys(features).length === 0) {
        setFeatures(data.means);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    try {
      await api.uploadCSV(e.target.files[0]);
      setAppState(prev => ({ ...prev, dataLoaded: true, isModelTrained: false }));
      // Reload data to ensure we have fresh content
      const data = await api.getDataPreview();
      setDataPreview(data);
      setCurrentPage(1);
      setFeatures(data.means);
    } catch (err) {
      alert("上传失败。请确保文件为 UTF-8 编码的 CSV 格式。");
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTrainingLoading(true);
    // Add a slight artificial delay to show off the cool animation
    setTimeout(async () => {
      try {
        const metrics = await api.trainModel(appState.modelType);
        setAppState(prev => ({
          ...prev,
          isModelTrained: true,
          trainingMetrics: metrics
        }));

        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#000000', '#3b82f6', '#db2777', '#facc15'], // Pop colors
          shapes: ['circle', 'square'],
        });
      } catch (err) {
        alert("训练失败，请检查数据格式。");
      } finally {
        setTrainingLoading(false);
      }
    }, 1500);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const result = await api.predict(features);
      setPrediction(result.prediction);
    } catch (err) {
      alert("预测失败，请输入有效的数值。");
    } finally {
      setLoading(false);
    }
  };

  // Generate Report Client-Side
  const generateClientSideReport = () => {
    if (prediction === null || !appState.trainingMetrics) {
      alert("请先运行预测以生成报告。");
      return;
    }

    const modelName = MODEL_NAME_MAPPING[appState.modelType] || appState.modelType;
    const dateStr = new Date().toLocaleString('zh-CN');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <title>预测分析报告 - DataMaster Pro</title>
        <style>
          body { 
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; 
            background: #f8fafc; 
            color: #0f172a; 
            padding: 20px;
          }
          .container { 
            background: white; 
            border: 2px solid black; 
            padding: 40px; 
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,1); 
            width: 100%;
            max-width: 800px;
            margin: 40px auto; 
          }
          h1 { border-bottom: 2px solid #000; padding-bottom: 10px; text-transform: uppercase; font-size: 24px; margin-bottom: 30px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; color: #64748b; font-weight: bold; }
          .section { margin-bottom: 30px; }
          h2 { font-size: 16px; background: #000; color: #fff; padding: 5px 10px; display: inline-block; margin-bottom: 15px; }
          .result-box { background: #3b82f6; color: white; padding: 30px; text-align: center; border: 2px solid black; margin: 20px 0; }
          .result-val { font-size: 48px; font-weight: 900; text-shadow: 2px 2px 0 #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; font-size: 14px; }
          th { background: #f1f5f9; font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
          
          @media print {
            body { padding: 0; background: white; }
            .container { box-shadow: none; border: none; margin: 0; width: 100%; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>预测分析报告 (Prediction Analysis)</h1>
          <div class="meta">
            <span>生成时间: ${dateStr}</span>
            <span>0234163 胡圣哲</span>
          </div>

          <div class="section">
            <h2>01. 模型概况</h2>
            <table>
              <tr><th>算法内核</th><td>${modelName}</td></tr>
              <tr><th>准确率 (R²)</th><td>${appState.trainingMetrics.r2.toFixed(4)}</td></tr>
              <tr><th>误差 (RMSE)</th><td>${appState.trainingMetrics.rmse.toFixed(4)}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>02. 输入特征参数</h2>
            <table>
              <thead><tr><th>特征变量 (Feature)</th><th>输入数值 (Value)</th></tr></thead>
              <tbody>
                ${Object.entries(features).map(([key, val]) => `<tr><td>${key}</td><td>${val}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>03. 预测结果</h2>
            <div class="result-box">
              <div style="font-size: 14px; margin-bottom: 10px; opacity: 0.9;">CALCULATED PREDICTION</div>
              <div class="result-val">${prediction.toFixed(2)}</div>
            </div>
          </div>

          <div class="footer">
            Generated by DataMaster Pro. 此报告仅供参考。<br/>
            该文档由前端引擎实时生成。
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // --- Pagination Logic ---
  const totalRows = dataPreview?.rows.length || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const currentRows = dataPreview?.rows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  ) || [];

  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // UI Components helpers
  const StepIndicator = ({ num, active }: { num: number, active: boolean }) => (
    <div className={`
      w-12 h-12 flex items-center justify-center font-display font-black text-xl border-2 border-black shadow-pop-sm transition-all duration-300
      ${active
        ? 'bg-primary text-white scale-110 -rotate-6'
        : 'bg-white text-gray-400'}
    `}>
      {num}
    </div>
  );

  // New Loading Skeleton Component
  const TrainingSkeleton = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl overflow-hidden border-2 border-dashed border-black">
      {/* Laser Scan Effect */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="w-full h-2 bg-accent shadow-[0_0_15px_rgba(255,71,133,0.8)] animate-scan absolute z-30" />
      </div>

      <div className="flex flex-col items-center gap-4 relative z-40">
        <Cpu size={48} className="animate-pulse-fast text-black" />
        <div className="space-y-2 text-center">
          <div className="text-xl font-display font-black uppercase">神经元激活中...</div>
          <div className="flex gap-1 justify-center">
            <div className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-32 space-y-16">

      {/* Header Section */}
      <header className="relative py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          {/* Sticker Badge */}
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: -6, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="absolute -top-6 -left-2 md:-left-6 inline-flex items-center gap-1 px-4 py-2 bg-yellow-300 text-black font-mono text-xs font-black uppercase tracking-widest border-2 border-black shadow-pop-sm z-20"
          >
            <Star size={12} className="fill-black" /> 0234163
          </motion.div>

          <h1 className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
            {/* Part 1: DATA - The "Hollow" Pop Style */}
            <span className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-white tracking-tighter leading-[0.85] text-stroke-3 text-shadow-pop">
              DATA
            </span>

            {/* Part 2: MASTER - The "Dazzling" Gradient Style */}
            <motion.span
              className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.85] relative"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {/* Outline layer */}
              <span className="absolute inset-0 text-transparent text-stroke-4 z-0" aria-hidden="true">
                MASTER
              </span>

              {/* Gradient Fill Layer */}
              <span className="relative z-10 bg-clip-text-standard bg-gradient-to-r from-primary via-purple-500 to-accent animate-gradient-text pb-2 inline-block">
                MASTER
              </span>

              {/* Deep Hard Shadow Layer */}
              <span className="absolute inset-0 text-transparent z-[-1] text-shadow-pop opacity-50" aria-hidden="true">
                MASTER
              </span>
            </motion.span>
          </h1>

          <p className="mt-8 text-xl md:text-2xl font-bold text-slate-500 max-w-2xl font-display border-l-4 border-black pl-4 ml-2">
            您的专业统计分析与预测建模 <span className="bg-black text-white px-2 py-0.5 transform -skew-x-6 inline-block">创意工作室</span>
          </p>
        </motion.div>
      </header>

      {/* STAGE 1: INGESTION */}
      <section className="relative">
        <div className="flex items-center gap-6 mb-8">
          <StepIndicator num={1} active={true} />
          <div className="h-0.5 bg-black flex-1 opacity-10 border-b-2 border-dashed border-black/20" />
          <h2 className="text-3xl font-display font-bold text-slate-900 uppercase">数据源输入</h2>
        </div>

        <GlassCard className="group">
          {/* Move input outside of conditional rendering to ensure it's always in DOM for button clicks */}
          <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleFileUpload} />

          {!appState.dataLoaded ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center relative z-10 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary transition-colors">
              <label
                htmlFor="file-upload"
                className="cursor-pointer group/label flex flex-col items-center justify-center w-full h-full absolute inset-0 py-10"
              >
                <div className="w-24 h-24 bg-white border-2 border-black shadow-pop mb-6 flex items-center justify-center group-hover/label:scale-110 transition-transform duration-300">
                  <Upload className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-display font-bold text-slate-900 mb-2">上传 CSV 文件</h3>
                <p className="text-slate-500 font-mono text-sm bg-white px-2 border border-slate-200">本工具目前仅支持 CSV 格式，请确认第一行为字段名</p>
              </label>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:w-1/3 space-y-4">
                {/* Data Stats Card */}
                <div className="p-6 bg-yellow-300 border-2 border-black shadow-pop relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-20 text-black">
                    <FileSpreadsheet size={60} />
                  </div>
                  <p className="text-xs font-black uppercase text-black mb-2 tracking-widest">数据集规模</p>
                  <div className="text-5xl font-display font-black text-black mb-1">
                    <CountUp end={dataPreview?.total_rows || 0} separator="," duration={2} />
                  </div>
                  <p className="text-black font-bold text-sm">行数据已成功索引</p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full py-4 bg-white border-2 border-black text-black font-bold shadow-pop-sm hover:shadow-pop hover:-translate-y-1 transition-all text-sm font-mono flex items-center justify-center gap-2 uppercase"
                >
                  <Upload size={16} /> 加载其他文件
                </button>
                <button
                  onClick={loadData}
                  className="w-full py-3 border-2 border-black bg-slate-100 text-slate-600 font-bold shadow-pop-sm hover:bg-slate-200 transition-all text-sm font-mono flex items-center justify-center gap-2 uppercase"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  刷新数据源
                </button>
              </div>

              {/* Table & Pagination Container */}
              <div className="w-full lg:w-2/3 border-2 border-black bg-white shadow-pop-sm flex flex-col">
                <div className="overflow-x-auto border-b-2 border-slate-100 min-h-[300px] max-h-[600px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 shadow-sm sticky top-0 z-10">
                      <tr className="text-xs font-mono font-bold uppercase text-slate-500 border-b-2 border-black">
                        <th className="px-4 py-4 w-12 border-r border-slate-200 bg-slate-100 text-center"><Hash size={14} /></th>
                        {dataPreview?.columns.map(col => (
                          <th key={col} className="px-6 py-4 whitespace-nowrap border-r border-slate-200 last:border-r-0 bg-slate-100">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 font-mono">
                      {currentRows.map((row, i) => (
                        <tr key={i} className="hover:bg-yellow-50 transition-colors border-b border-slate-100 last:border-b-0">
                          <td className="px-4 py-4 text-center border-r border-slate-100 text-slate-400 text-xs font-bold">
                            {(currentPage - 1) * rowsPerPage + i + 1}
                          </td>
                          {row.map((cell: any, j: number) => (
                            <td key={j} className="px-6 py-4 whitespace-nowrap border-r border-slate-100 last:border-r-0">{cell}</td>
                          ))}
                        </tr>
                      ))}
                      {/* Empty State for page filler */}
                      {currentRows.length === 0 && (
                        <tr>
                          <td colSpan={dataPreview ? dataPreview.columns.length + 1 : 1} className="p-8 text-center text-slate-400 font-bold italic">
                            暂无更多数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* New Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-0.5 rounded-sm">PAGE {currentPage}</span>
                    <span>/ {totalPages} ({totalRows} TOTAL)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-2 border-2 border-black bg-white shadow-pop-sm hover:translate-y-0.5 hover:shadow-none active:bg-slate-100 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                      title="上一页"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers (Simple) */}
                    <div className="hidden sm:flex gap-1 font-mono text-sm font-bold">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Simple logic to show window around current page
                        let p = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          p = currentPage - 2 + i;
                          if (p > totalPages) p = i + (totalPages - 4);
                        }
                        return (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 border-2 border-black flex items-center justify-center transition-all ${currentPage === p ? 'bg-black text-white' : 'bg-white hover:bg-slate-100'}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 border-2 border-black bg-white shadow-pop-sm hover:translate-y-0.5 hover:shadow-none active:bg-slate-100 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                      title="下一页"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </section>

      {/* STAGE 2: TRAINING */}
      <AnimatePresence>
        {appState.dataLoaded && (
          <motion.section
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative"
          >
            <div className="flex items-center gap-6 mb-8">
              <StepIndicator num={2} active={appState.isModelTrained} />
              <div className="h-0.5 bg-black flex-1 opacity-10 border-b-2 border-dashed border-black/20" />
              <h2 className="text-3xl font-display font-bold text-slate-900 uppercase">模型实验室</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
              {/* LOADING OVERLAY - Spans across the grid */}
              <AnimatePresence>
                {trainingLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 pointer-events-none"
                  >
                    <TrainingSkeleton />
                  </motion.div>
                )}
              </AnimatePresence>

              <GlassCard className="lg:col-span-1 flex flex-col justify-between bg-white" hoverEffect={false}>
                <div>
                  <h4 className="text-slate-400 text-xs font-black uppercase mb-6 tracking-widest">参数配置</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-2 border-black flex flex-col gap-2 shadow-pop-sm">
                      <span className="text-slate-600 font-bold text-sm">算法内核</span>
                      <span className="text-primary font-black font-mono text-sm uppercase break-words">
                        {MODEL_NAME_MAPPING[appState.modelType] || appState.modelType}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 border-2 border-black flex items-center justify-between shadow-pop-sm">
                      <span className="text-slate-600 font-bold text-sm">目标变量</span>
                      <span className="text-accent font-black font-mono text-sm uppercase">
                        {dataPreview?.columns[dataPreview.columns.length - 1]}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleTrain}
                  disabled={trainingLoading}
                  className="mt-8 w-full group relative overflow-hidden bg-black text-white font-black py-5 border-2 border-black shadow-pop hover:bg-slate-800 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 active:translate-y-1 active:shadow-none"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wide">
                    {trainingLoading ? <ScanLine className="animate-pulse" /> : <BrainCircuit />}
                    {trainingLoading ? '正在分析...' : '开始训练'}
                  </span>
                </button>
              </GlassCard>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {appState.isModelTrained && appState.trainingMetrics && !trainingLoading ? (
                  <>
                    <GlassCard className="relative overflow-hidden group bg-green-400">
                      <div className="absolute top-0 right-0 p-4 opacity-20 text-black">
                        <Sparkles size={100} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-black font-black text-sm mb-2 uppercase border-b-2 border-black inline-block">准确率评分 (R²)</p>
                        <div className="text-4xl md:text-5xl font-display font-black text-black tracking-tighter mt-2 break-all">
                          <CountUp end={appState.trainingMetrics.r2} decimals={4} duration={2} />
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="relative overflow-hidden group bg-accent">
                      <div className="absolute top-0 right-0 p-4 opacity-20 text-black">
                        <Activity size={100} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-black font-black text-sm mb-2 uppercase border-b-2 border-black inline-block">误差率 (RMSE)</p>
                        <div className="text-4xl md:text-5xl font-display font-black text-black tracking-tighter mt-2 break-all">
                          <CountUp end={appState.trainingMetrics.rmse} decimals={4} duration={2} />
                        </div>
                      </div>
                    </GlassCard>
                  </>
                ) : (
                  <div className="lg:col-span-2 h-full min-h-[200px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50">
                    <p className="text-slate-400 font-bold flex items-center gap-2 uppercase">
                      <AlertCircle size={20} /> 等待训练序列
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* STAGE 3: INFERENCE */}
      <AnimatePresence>
        {appState.isModelTrained && (
          <motion.section
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative"
          >
            <div className="flex items-center gap-6 mb-8">
              <StepIndicator num={3} active={prediction !== null} />
              <div className="h-0.5 bg-black flex-1 opacity-10 border-b-2 border-dashed border-black/20" />
              <h2 className="text-3xl font-display font-bold text-slate-900 uppercase">预测器</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Controls */}
              <GlassCard className="xl:col-span-2 bg-white">
                <h4 className="text-black font-black text-lg uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2 w-fit">
                  调整输入变量
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(features).map((feature) => (
                    <div key={feature} className="group">
                      <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">{feature}</label>
                      <input
                        type="number"
                        value={features[feature]}
                        onChange={(e) => setFeatures(prev => ({ ...prev, [feature]: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-mono font-bold focus:bg-yellow-50 focus:shadow-pop-sm outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Output Panel */}
              <div className="xl:col-span-1 flex flex-col gap-4">
                <div className="flex-1 bg-primary border-2 border-black p-8 relative overflow-hidden shadow-pop flex flex-col items-center justify-between text-center rounded-xl">

                  <div className="w-full">
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b-2 border-black/20 pb-2">计算结果</h3>

                    <div className="py-6">
                      {prediction !== null ? (
                        <motion.div
                          key={prediction}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-5xl md:text-6xl font-display font-black text-white text-stroke-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] break-all"
                        >
                          <CountUp end={prediction} decimals={2} duration={1} preserveValue />
                        </motion.div>
                      ) : (
                        <div className="text-6xl font-display font-black text-black/20">--.--</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handlePredict}
                    className="w-full py-4 bg-white border-2 border-black text-black font-black text-lg uppercase shadow-pop-sm hover:shadow-pop hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={20} className="fill-black" /> 运行预测
                  </button>
                </div>

                <button
                  onClick={generateClientSideReport}
                  className="py-4 px-6 bg-white border-2 border-black hover:bg-slate-50 text-black font-bold uppercase text-xs flex items-center justify-center gap-2 shadow-pop-sm transition-all"
                >
                  查看完整报告 (中文) <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};