
import React from 'react';
import { Resource } from '../types';

interface Props {
  resource: Resource;
  isHighlighted?: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (resource: Resource) => void;
}

const ResourceCard: React.FC<Props> = React.memo(({ resource, isHighlighted, isFavorite, onToggleFavorite, onViewDetails }) => {
  return (
    <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${isHighlighted ? 'border-indigo-400 scale-[1.02]' : 'border-transparent'}`}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(resource.id);
        }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isFavorite 
            ? 'bg-pink-500 text-white scale-110 shadow-lg' 
            : 'bg-white/90 text-gray-400 hover:text-pink-500 opacity-0 group-hover:opacity-100'
        }`}
      >
        <i className={`fa-solid fa-heart ${isFavorite ? 'animate-pulse' : ''}`}></i>
      </button>

      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={resource.image} 
          alt={resource.title} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur shadow-sm text-[9px] font-black rounded-lg text-indigo-600 uppercase">
            {resource.type === 'book' ? '📖 绘本' : '🎲 桌游'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-indigo-600/90 text-white text-[9px] font-bold rounded-lg">
            {resource.ageRange}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-black text-gray-800 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
          {resource.title}
        </h3>
        
        <p className="text-gray-400 text-[10px] leading-tight line-clamp-2 italic mb-3">
          "{resource.whyItsGood}"
        </p>
        
        <button 
          onClick={() => onViewDetails(resource)}
          className="w-full py-2 bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-bold text-[10px] rounded-lg transition-all"
        >
          查看详情
        </button>
      </div>
    </div>
  );
});

ResourceCard.displayName = 'ResourceCard';

export default ResourceCard;
