import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  Terminal,
  Cpu,
  TrendingUp,
  AlertOctagon,
  Lightbulb
} from 'lucide-react';

export const Docs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 mb-4 uppercase tracking-tight">
          用户<span className="text-black">手册</span>
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-mono text-sm font-bold -rotate-2 shadow-pop-sm">
          <Terminal size={16} className="text-green-400" />
          DataMaster 使用指南
        </div>
      </motion.header>

      {/* 1. 概览 */}
      <GlassCard title="1. 核心概览" delay={0.1}>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="p-6 bg-blue-100 border-2 border-black text-blue-600 shadow-pop-sm flex-shrink-0 w-24 h-24 flex items-center justify-center rounded-xl">
            <Cpu size={48} />
          </div>
          <div className="space-y-4 flex-1">
            <h4 className="font-display font-black text-2xl uppercase">您的零代码 AI 分析师</h4>
            <p className="text-slate-600 leading-relaxed font-medium text-lg">
              DataMaster 旨在将复杂的机器学习流程简化为直观的交互体验。
            </p>
            <p className="text-slate-600 leading-relaxed font-medium text-lg">我们专注于<span className="bg-yellow-200 px-1 border border-black font-bold mx-1">回归预测 (Regression)</span>任务，帮助您从历史数据中发现规律，并预测未来数值。
            </p>
            <div className="pt-2">
              <p className="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">内置算法引擎</p>
              <div className="flex flex-wrap gap-2">
                {['线性回归', '决策树', '随机森林', 'SVR (支持向量机)'].map(algo => (
                  <span key={algo} className="px-3 py-1 bg-slate-100 border-2 border-slate-200 text-slate-600 text-xs font-bold font-mono">
                    {algo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. 工作流程 */}
      <GlassCard title="2. 标准工作流与数据规范" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { step: '01', title: '数据清洗', desc: '准备 CSV 格式数据', icon: FileText, color: 'bg-yellow-200' },
            { step: '02', title: '模型训练', desc: '自动特征工程与拟合', icon: Cpu, color: 'bg-pink-200' },
            { step: '03', title: '交互预测', desc: 'What-If 场景推演', icon: TrendingUp, color: 'bg-green-200' }
          ].map((item, index) => (
            <div key={index} className={`relative overflow-hidden flex flex-col items-center p-6 border-2 border-black shadow-pop-sm ${item.color} group hover:-translate-y-1 transition-transform`}>
              <div className="absolute top-2 right-2 font-black text-4xl opacity-10">{item.step}</div>
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-4 border-2 border-white shadow-sm">
                <item.icon size={24} />
              </div>
              <h4 className="font-display font-black text-slate-900 uppercase text-lg">{item.title}</h4>
              <p className="text-sm font-bold text-slate-700 mt-1 opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 border-2 border-black p-6 relative">
          <div className="absolute -top-3 left-4 bg-black text-white px-2 py-1 text-xs font-bold font-mono uppercase">
            必读: CSV 格式示例
          </div>
          <div className="flex flex-col md:flex-row gap-8 font-mono text-sm">
            <div className="flex-1">
              <p className="font-bold text-red-500 mb-2 flex items-center gap-2"><XCircle size={16} /> 错误格式</p>
              <div className="bg-red-50 p-4 border border-red-200 text-slate-500">
                数据表说明书<br />
                广告费, 销售额, 日期<br />
                100, 2000, 2023-01<br />
                无, 3000, 2023-02
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-600 mb-2 flex items-center gap-2"><CheckCircle size={16} /> 正确格式</p>
              <div className="bg-white p-4 border-2 border-green-500 text-slate-800 shadow-pop-sm">
                TV_Ads, Radio_Ads, Sales<br />
                100.5, 20.0, 2050<br />
                150.0, 35.5, 3100<br />
                200.0, 15.0, 2800
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs font-bold text-slate-500">
            * 提示：第一行必须是英文表头；数据不能包含空值或非数字字符；最后一列默认作为<span className="text-black underline">目标变量 (Target)</span>。
          </p>
        </div>
      </GlassCard>

      {/* 3. 常见问题 & 模型指南 */}
      <GlassCard title="3. 专家指南 (FAQ)" delay={0.3}>
        <div className="space-y-6">
          <div className="border-b-2 border-slate-100 pb-6">
            <h4 className="flex items-center gap-2 font-display font-black text-xl mb-4 text-slate-900">
              <Lightbulb className="text-yellow-500 fill-yellow-500" /> 我该选择哪种算法？
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. 线性回归 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 hover:border-black transition-colors">
                <span className="block font-black text-xs uppercase text-primary mb-2">线性回归 (Linear Regression)</span>
                <p className="text-sm font-bold text-slate-600 leading-snug">
                  最基础的模型。当变量之间存在简单的比例关系（如：广告费越多，销量越高）时使用，计算速度最快，结果最容易解释。
                </p>
              </div>

              {/* 2. 决策树 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 hover:border-black transition-colors">
                <span className="block font-black text-xs uppercase text-purple-500 mb-2">决策树 (Decision Tree)</span>
                <p className="text-sm font-bold text-slate-600 leading-snug">
                  像一系列“如果-那么”的规则组合。适合处理非线性关系，直观易懂，但如果树太深，容易过于关注细节而产生误差（过拟合）。
                </p>
              </div>

              {/* 3. 随机森林 */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 hover:border-black transition-colors">
                <span className="block font-black text-xs uppercase text-accent mb-2">随机森林 (Random Forest)</span>
                <p className="text-sm font-bold text-slate-600 leading-snug">
                  “万金油”模型，由多棵决策树投票产生结果。当你不知道数据有什么规律，或者数据非常复杂时，选它最稳，准确率通常最高。
                </p>
              </div>

              {/* 4. SVR */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 hover:border-black transition-colors">
                <span className="block font-black text-xs uppercase text-orange-500 mb-2">SVR (支持向量机)</span>
                <p className="text-sm font-bold text-slate-600 leading-snug">
                  适合小样本、高维度的数据。它试图在多维空间中找到最佳拟合平面，对数据中的异常噪点有较好的容忍度。
                </p>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            {[
              { q: "R² 分数 (准确率) 为负数?", a: "这意味着模型的预测效果极差，比盲猜平均值还要糟糕。通常是因为数据量太少，或者选错了算法（例如用线性模型去拟合非线性数据）。" },
              { q: "上传 CSV 后没反应?", a: "请检查：1. 文件名是否为英文；2. 文件编码必须是 UTF-8；3. 文件大小建议不超过 10MB。" },
              { q: "预测结果不准确?", a: "机器学习依赖于历史数据。如果输入的数据特征在训练集中从未出现过（例如训练数据全是夏天，你却预测冬天），结果可能偏差较大。" }
            ].map((faq, i) => (
              <li key={i} className="flex gap-4 items-start bg-white p-4 border-2 border-black hover:bg-slate-50 transition-colors">
                <HelpCircle className="text-black shrink-0 mt-1" size={20} />
                <div>
                  <span className="block font-black text-sm uppercase text-slate-400 mb-1">{faq.q}</span>
                  <span className="font-bold text-slate-800 leading-snug">{faq.a}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>

      {/* 4. 适用范围 */}
      <GlassCard title="4. 数据适用性规范" delay={0.4}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-100 border-2 border-black p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle size={100} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 text-white p-2 border-2 border-black rounded-lg">
                <CheckCircle size={20} />
              </div>
              <span className="text-green-900 font-display font-black uppercase">适用场景 (Supported)</span>
            </div>
            <ul className="space-y-2 text-sm font-bold text-green-800 list-disc list-inside marker:text-black">
              <li>结构化表格数据 (Excel/CSV)</li>
              <li>数值型预测 (房价、销量、温度)</li>
              <li>特征因子分析</li>
              <li>中小规模数据集 (小于 50,000 行)</li>
            </ul>
          </div>

          <div className="bg-red-100 border-2 border-black p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertOctagon size={100} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500 text-white p-2 border-2 border-black rounded-lg">
                <AlertOctagon size={20} />
              </div>
              <span className="text-red-900 font-display font-black uppercase">不支持 (Not Supported)</span>
            </div>
            <ul className="space-y-2 text-sm font-bold text-red-800 list-disc list-inside marker:text-black">
              <li>非结构化数据 (图片、音频、视频)</li>
              <li>自然语言文本 (聊天记录、文章)</li>
              <li>分类任务 (是/否，猫/狗)</li>
              <li>时间序列强相关分析</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};