
import React from 'react';
import { Resource } from '../types';

interface Props {
  resource: Resource | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}

const DetailModal: React.FC<Props> = ({ resource, isFavorite, onToggleFavorite, onClose }) => {
  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-xl transition-all active:scale-90"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="w-full md:w-5/12 h-72 md:h-auto overflow-hidden">
          <img 
            src={resource.image} 
            alt={resource.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 p-8 md:p-14 overflow-y-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
              {resource.type === 'book' ? '📖 绘本' : '🎲 桌游'}
            </span>
            <span className="px-4 py-1.5 bg-yellow-400 text-indigo-900 text-[10px] font-black rounded-full uppercase tracking-widest">
              {resource.ageRange}
            </span>
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
            {resource.title}
          </h2>

          <div className="flex flex-wrap gap-1.5 mb-8">
            {resource.categories.map(cat => (
              <span key={cat} className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-tight italic">
                #{cat}
              </span>
            ))}
          </div>

          <div className="space-y-10">
            <section>
              <h4 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-quote-left text-[10px]"></i> 推荐理由
              </h4>
              <p className="text-gray-700 text-xl leading-relaxed italic border-l-4 border-indigo-100 pl-6">
                "{resource.whyItsGood}"
              </p>
            </section>

            <section>
              <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-align-left text-[10px]"></i> 详细简介
              </h4>
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {resource.description || '暂无详细介绍，欢迎在同步 Excel 时完善。'}
              </p>
            </section>
          </div>

          <div className="mt-14 pt-8 border-t border-gray-100 flex gap-4">
            <button 
              onClick={() => onToggleFavorite(resource.id)}
              className={`flex-1 py-5 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                isFavorite 
                  ? 'bg-pink-50 text-pink-600 hover:bg-pink-100 shadow-pink-100 border border-pink-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <i className={`fa-solid fa-heart ${isFavorite ? 'scale-125' : ''}`}></i>
              {isFavorite ? '已收藏' : '加入收藏清单'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
