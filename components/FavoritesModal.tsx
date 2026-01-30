import React, { useState } from 'react';
import { Resource, Folder } from '../types';
import ResourceCard from './ResourceCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  dataset: Resource[];
  folders: Folder[];
  isLoggedIn: boolean;
  onUpdateFolders: (folders: Folder[]) => void;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (resource: Resource) => void;
  onExport?: () => void;
}

const FavoritesModal: React.FC<Props> = ({ 
  isOpen, onClose, favorites, dataset, folders, isLoggedIn, onUpdateFolders, onToggleFavorite, onViewDetails, onExport 
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const favoriteItems = dataset.filter(item => favorites.includes(item.id));
  
  const displayedItems = activeFolderId === 'all' 
    ? favoriteItems 
    : favoriteItems.filter(item => {
        const folder = folders.find(f => f.id === activeFolderId);
        return folder?.itemIds.includes(item.id);
      });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      itemIds: []
    };
    onUpdateFolders([...folders, newFolder]);
    setNewFolderName('');
    setShowAddFolder(false);
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm('确定要删除这个收藏夹吗？文件夹内的内容不会被取消收藏。')) {
      onUpdateFolders(folders.filter(f => f.id !== id));
      setActiveFolderId('all');
    }
  };

  const toggleItemInFolder = (resourceId: string, folderId: string) => {
    const updatedFolders = folders.map(f => {
      if (f.id === folderId) {
        const exists = f.itemIds.includes(resourceId);
        return {
          ...f,
          itemIds: exists 
            ? f.itemIds.filter(id => id !== resourceId) 
            : [...f.itemIds, resourceId]
        };
      }
      return f;
    });
    onUpdateFolders(updatedFolders);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      {/* Centered Backdrop */}
      <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      {/* Centered Main Panel */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#fafafc] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in fade-in duration-300">
        
        {/* Header */}
        <div className="bg-white px-8 pt-8 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-heart text-pink-500"></i> 我的书架
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                分类整理您的心头好 ({favoriteItems.length})
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onExport && favoriteItems.length > 0 && (
                <button 
                  onClick={onExport} 
                  className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-black hover:bg-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                >
                  <i className="fa-solid fa-download"></i> 导出书单
                </button>
              )}
              <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all active:scale-90"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Folder Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar flex-1 w-full">
              <button 
                onClick={() => setActiveFolderId('all')}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${
                  activeFolderId === 'all' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                }`}
              >
                全部收藏
              </button>
              
              {folders.map(folder => (
                <div key={folder.id} className="relative group/folder flex-shrink-0">
                  <button 
                    onClick={() => setActiveFolderId(folder.id)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border flex items-center gap-2 ${
                      activeFolderId === folder.id 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm' 
                      : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                    }`}
                  >
                    <i className="fa-solid fa-folder-open text-[10px]"></i>
                    {folder.name}
                    <span className="opacity-40 font-normal">({folder.itemIds.length})</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600 transition-colors opacity-0 group-hover/folder:opacity-100"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}

              {showAddFolder ? (
                <div className="flex items-center gap-2 flex-shrink-0 animate-in fade-in slide-in-from-left-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="新文件夹名称..."
                    className="px-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 w-32 outline-none"
                  />
                  <button onClick={handleCreateFolder} className="text-indigo-600 font-bold text-xs">确定</button>
                  <button onClick={() => setShowAddFolder(false)} className="text-gray-300 text-xs"><i className="fa-solid fa-xmark"></i></button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAddFolder(true)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-black text-indigo-600 border border-dashed border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <i className="fa-solid fa-plus"></i> 新建分类
                </button>
              )}
            </div>

            {!isLoggedIn && (
              <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 shrink-0">
                <i className="fa-solid fa-circle-exclamation text-amber-500 text-[10px]"></i>
                <p className="text-[10px] text-amber-700 font-medium whitespace-nowrap">
                  登录可永久同步书架
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          {displayedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedItems.map(item => (
                <div key={item.id} className="relative group/card h-fit">
                  <ResourceCard 
                    resource={item} 
                    isFavorite={true} 
                    onToggleFavorite={onToggleFavorite} 
                    onViewDetails={onViewDetails} 
                  />
                  
                  {/* Folder Assignment Overlay Button */}
                  <div className="absolute top-12 right-3 z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingResourceId(editingResourceId === item.id ? null : item.id);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        editingResourceId === item.id ? 'bg-indigo-600 text-white' : 'bg-white/90 text-indigo-600 border border-indigo-50 hover:scale-110'
                      }`}
                      title="移动到分类"
                    >
                      <i className="fa-solid fa-folder-tree text-[10px]"></i>
                    </button>
                    
                    {editingResourceId === item.id && (
                      <div className="absolute top-10 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in duration-200">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">移动至分类</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                          {folders.length > 0 ? folders.map(folder => {
                            const isInFolder = folder.itemIds.includes(item.id);
                            return (
                              <button 
                                key={folder.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItemInFolder(item.id, folder.id);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                                  isInFolder ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-gray-50 text-gray-600'
                                }`}
                              >
                                {folder.name}
                                {isInFolder && <i className="fa-solid fa-check text-[10px]"></i>}
                              </button>
                            );
                          }) : (
                            <p className="text-[10px] text-gray-300 italic p-2 text-center">请先创建分类</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 text-4xl mb-6">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">此处空空如也</h3>
              <p className="text-gray-400 leading-relaxed italic max-w-sm">
                {activeFolderId === 'all' 
                  ? '您还没有收藏任何好书或桌游，快去首页逛逛吧！' 
                  : '该分类下暂时没有内容。'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;
