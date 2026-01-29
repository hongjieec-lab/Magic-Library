
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DATASET as MOCK_DATASET, APP_DATA_VERSION } from './constants';
import { Resource, RecommendationResult, Folder, User } from './types';
import ResourceCard from './components/ResourceCard';
import DetailModal from './components/DetailModal';
import AdminPortal from './components/AdminPortal';
import UserPortal from './components/UserPortal';
import FavoritesModal from './components/FavoritesModal';
import ShareModal from './components/ShareModal';
import { getRecommendations } from './services/geminiService';

const ITEMS_PER_PAGE = 24;

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showUserPortal, setShowUserPortal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [page, setPage] = useState(1);
  const [needsKeyConfig, setNeedsKeyConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('magic_library_api_key') || '');

  // --- 数据管理与持久化 ---
  const [currentDataset, setCurrentDataset] = useState<Resource[]>(() => {
    try {
      const savedVersion = localStorage.getItem('magic_library_data_version');
      if (savedVersion !== APP_DATA_VERSION) {
        localStorage.removeItem('magic_library_custom_dataset');
        localStorage.setItem('magic_library_data_version', APP_DATA_VERSION);
        localStorage.setItem('magic_library_is_custom', 'false');
        return MOCK_DATASET;
      }
      const saved = localStorage.getItem('magic_library_custom_dataset');
      return saved ? JSON.parse(saved) : MOCK_DATASET;
    } catch { return MOCK_DATASET; }
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(['hong.jie.ec@gmail.com']);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 初始化环境检查
  useEffect(() => {
    const checkKey = async () => {
      const envKey = import.meta.env.VITE_API_KEY;
      const hasEnvKey = envKey && envKey !== "undefined" && envKey !== "null" && envKey !== "";
      if (!hasEnvKey && !customApiKey) setNeedsKeyConfig(true);
    };
    checkKey();
  }, [customApiKey]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiKey.trim()) {
      localStorage.setItem('magic_library_api_key', customApiKey.trim());
      setNeedsKeyConfig(false);
      alert("✅ 魔法能量已注入！");
    }
  };

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setNeedsKeyConfig(false);
      } catch (err) { console.error(err); }
    } else {
      const manualKey = prompt("请输入您的 Gemini API Key:");
      if (manualKey) {
        setCustomApiKey(manualKey);
        localStorage.setItem('magic_library_api_key', manualKey);
        setNeedsKeyConfig(false);
      }
    }
  };

  const handleBackToHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRecommendation(null);
    setQuery('');
    setActiveCategory('全部');
    setPage(1);
    setIsSearching(false);
  }, []);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    setRecommendation(null);
    try {
      const result = await getRecommendations(query, currentDataset);
      setRecommendation(result);
    } catch (err: any) {
      if (err.message === "MISSING_API_KEY" || err.message === "INVALID_API_KEY") {
        setNeedsKeyConfig(true);
      }
      setRecommendation({ matches: [], aiSummary: "🔑 请检查 API 密钥配置。" });
    } finally {
      setIsSearching(false);
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [query, currentDataset, isSearching]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // --- 精准年龄解析匹配逻辑 (基于起始年龄 X) ---
  const matchesAgeFilter = (ageStr: string, filter: string) => {
    // 提取描述中的所有数字（支持 1.5 等小数）
    const numbers = ageStr.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    if (numbers.length === 0) return false;
    
    // 规则：以描述中的第一个数字 X 为准
    const startAge = numbers[0];

    if (filter === '0-2') return startAge < 2;
    if (filter === '2-4') return startAge >= 2 && startAge < 4;
    if (filter === '4-6') return startAge >= 4 && startAge < 6;
    if (filter === '6+') return startAge >= 6;
    
    return false;
  };

  const allFilteredData = useMemo(() => {
    let data = currentDataset;
    if (activeCategory === '全部') return data;
    if (activeCategory === '绘本') return data.filter(item => item.type === 'book');
    if (activeCategory === '桌游') return data.filter(item => item.type === 'game');
    
    // 如果点击的是年龄分类按钮
    if (['0-2', '2-4', '4-6', '6+'].includes(activeCategory)) {
      return data.filter(item => matchesAgeFilter(item.ageRange, activeCategory));
    }
    
    // 其他自定义标签过滤
    return data.filter(item => item.categories.includes(activeCategory));
  }, [activeCategory, currentDataset]);

  const paginatedData = useMemo(() => allFilteredData.slice(0, page * ITEMS_PER_PAGE), [allFilteredData, page]);

  return (
    <div className="min-h-screen bg-[#fafafc] pb-24 font-sans selection:bg-indigo-100">
      <DetailModal resource={selectedResource} isFavorite={selectedResource ? favorites.includes(selectedResource.id) : false} onToggleFavorite={toggleFavorite} onClose={() => setSelectedResource(null)} />
      <AdminPortal isOpen={showAdminPortal} onClose={() => setShowAdminPortal(false)} isAdmin={isAdmin} setIsAdmin={setIsAdmin} authorizedEmails={authorizedEmails} setAuthorizedEmails={setAuthorizedEmails} currentDataset={currentDataset} onUpdateDataset={(d) => { setCurrentDataset(d); localStorage.setItem('magic_library_custom_dataset', JSON.stringify(d)); }} onResetDataset={() => { localStorage.clear(); window.location.reload(); }} isCustomData={localStorage.getItem('magic_library_is_custom') === 'true'} />
      <UserPortal isOpen={showUserPortal} onClose={() => setShowUserPortal(false)} onLogin={setCurrentUser} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      <FavoritesModal isOpen={showFavoritesModal} onClose={() => setShowFavoritesModal(false)} favorites={favorites} dataset={currentDataset} folders={folders} isLoggedIn={!!currentUser} onUpdateFolders={setFolders} onToggleFavorite={toggleFavorite} onViewDetails={setSelectedResource} />
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} url={window.location.href} />

      <header className="relative bg-gradient-to-br from-indigo-900 via-indigo-600 to-purple-800 text-white pt-10 pb-24 px-6">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div className="cursor-pointer group" onClick={handleBackToHome}>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md group-hover:text-yellow-300 transition-colors">魔法图书馆 <span className="text-yellow-300 italic group-hover:text-white transition-colors">Magic</span></h1>
              <p className="text-indigo-100/80 text-sm mt-1 font-medium">寻找最适合孩子的成长伴侣</p>
            </div>
            <button onClick={() => setShowAdminPortal(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl text-xs font-black transition-all active:scale-95"><i className="fa-solid fa-gear"></i></button>
          </div>

          <form onSubmit={handleSearch} className="relative group max-w-2xl">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="试试搜索“关于分享的绘本”..." className="w-full px-6 py-5 rounded-2xl bg-white text-gray-800 shadow-2xl focus:ring-4 focus:ring-yellow-400/50 outline-none pr-32 text-lg border-none" />
            <button type="submit" disabled={isSearching} className="absolute right-2 top-2 bottom-2 px-6 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-black rounded-xl transition-all disabled:opacity-50 min-w-[120px] flex items-center justify-center gap-2">
              {isSearching ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              {isSearching ? '检索中' : 'AI 寻找'}
            </button>
          </form>
          
          {needsKeyConfig && (
            <div className="mt-8 p-6 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md">
              <p className="text-sm font-black text-yellow-300 mb-3 flex items-center gap-2"><i className="fa-solid fa-key"></i> 激活 AI 检索能力</p>
              {window.aistudio ? (
                <button onClick={handleOpenKeyDialog} className="px-6 py-3 bg-yellow-400 text-indigo-900 rounded-xl font-black text-sm shadow-xl hover:bg-yellow-300 transition-all">关联密钥</button>
              ) : (
                <form onSubmit={handleSaveApiKey} className="flex gap-2">
                  <input type="password" value={customApiKey} onChange={(e) => setCustomApiKey(e.target.value)} placeholder="粘贴您的 Gemini API Key" className="flex-1 px-4 py-3 bg-white/90 text-gray-800 rounded-xl outline-none text-xs" />
                  <button className="px-6 py-3 bg-yellow-400 text-indigo-900 rounded-xl font-black text-xs">保存</button>
                </form>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-3xl shadow-xl border border-indigo-50 flex flex-col items-center">
            <span className="text-2xl font-black text-indigo-600">{currentDataset.length}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">书库总量</span>
          </div>
          <button onClick={() => setShowFavoritesModal(true)} className="bg-white p-5 rounded-3xl shadow-xl border border-indigo-50 flex flex-col items-center hover:bg-pink-50 transition-colors">
            <span className="text-2xl font-black text-pink-500">{favorites.length}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">收藏夹</span>
          </button>
        </section>

        {recommendation && (
          <div id="results-section" className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border-2 border-indigo-100">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg"><i className="fa-solid fa-sparkles"></i></div>
                  <h2 className="text-xl font-black text-gray-800">馆长推荐 ({recommendation.matches.length})</h2>
                </div>
                <button onClick={() => setRecommendation(null)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-all"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="relative mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium">{recommendation.aiSummary}</p>
              </div>
              {recommendation.matches.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentDataset.filter(item => recommendation.matches.includes(item.id)).map(item => (
                    <ResourceCard key={item.id} resource={item} isHighlighted isFavorite={favorites.includes(item.id)} onToggleFavorite={toggleFavorite} onViewDetails={setSelectedResource} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8">
          {['全部', '绘本', '桌游', '0-2', '2-4', '4-6', '6+'].map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setPage(1); }} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}>
              {cat === '0-2' ? '0-2岁' : cat === '2-4' ? '2-4岁' : cat === '4-6' ? '4-6岁' : cat === '6+' ? '6岁+' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {paginatedData.length > 0 ? paginatedData.map(item => (
            <ResourceCard key={item.id} resource={item} isFavorite={favorites.includes(item.id)} onToggleFavorite={toggleFavorite} onViewDetails={setSelectedResource} />
          )) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-gray-200 text-5xl mb-4"><i className="fa-solid fa-magnifying-glass"></i></div>
              <p className="text-gray-400 italic">该分类下暂时没有资源</p>
            </div>
          )}
        </div>

        {paginatedData.length < allFilteredData.length && (
          <div className="flex justify-center pb-20">
            <button onClick={() => setPage(p => p + 1)} className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-all border border-indigo-100 active:scale-95">加载更多...</button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-2 flex justify-around items-center">
          <button onClick={handleBackToHome} className="p-3 text-indigo-900 hover:text-indigo-600 transition-colors active:scale-110"><i className="fa-solid fa-house text-xl"></i></button>
          <button onClick={() => setShowFavoritesModal(true)} className="p-3 text-pink-500 hover:scale-110 transition-all active:scale-125"><i className="fa-solid fa-heart text-xl"></i></button>
          <button onClick={() => setShowUserPortal(true)} className="p-3 text-indigo-900 hover:text-indigo-600 transition-colors active:scale-110"><i className="fa-solid fa-user text-xl"></i></button>
        </div>
      </footer>
    </div>
  );
};

export default App;
