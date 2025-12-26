import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelType } from './types';
import type { AppState } from './types';
import { NAV_ITEMS, THEME_COLORS } from './constants';
import { Workflow } from './pages/Workflow';
import { Docs } from './pages/Docs';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    modelType: ModelType.LINEAR_REGRESSION,
    themeColor: THEME_COLORS[0].hex,
    // CHANGED: Default to 50 rows per page so users see more data immediately
    paginationSize: 50,
    isModelTrained: false,
    trainingMetrics: null,
    dataLoaded: false,
    activePage: 'workflow'
  });

  const renderPage = () => {
    switch (appState.activePage) {
      case 'workflow': return <Workflow appState={appState} setAppState={setAppState} />;
      case 'docs': return <Docs />;
      case 'settings': return <Settings appState={appState} setAppState={setAppState} />;
      default: return <Workflow appState={appState} setAppState={setAppState} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 font-sans selection:bg-black selection:text-white">
      {/* Floating Sidebar */}
      <aside className="fixed left-4 top-4 bottom-4 w-20 md:w-24 bg-white border-2 border-black rounded-2xl flex flex-col items-center py-8 z-50 shadow-pop">
        <div className="mb-12">
          <div className="w-12 h-12 rounded-lg bg-primary border-2 border-black flex items-center justify-center text-white font-display font-black text-2xl shadow-pop-sm text-stroke-2">
            D
          </div>
        </div>

        <nav className="flex-1 space-y-6 w-full px-2 flex flex-col items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = appState.activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setAppState(prev => ({ ...prev, activePage: item.id as any }))}
                className="group relative p-3 w-full flex justify-center outline-none"
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-yellow-300 rounded-xl border-2 border-black shadow-pop-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
                <div className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Icon
                    className={`w-6 h-6 transition-colors duration-200 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-black'}`}
                    strokeWidth={2.5}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full border-2 border-black transition-colors duration-500 ${appState.dataLoaded ? 'bg-green-500' : 'bg-red-400'}`}
            title={appState.dataLoaded ? "系统就绪" : "无数据"}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-28 md:ml-32 overflow-y-auto relative h-screen">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={appState.activePage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;