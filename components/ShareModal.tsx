
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const ShareModal: React.FC<Props> = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("✅ 链接已复制到剪贴板！");
    } catch (err) {
      alert("复制失败，请手动选择链接复制");
    }
  };

  // Using a reliable QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h2 className="text-xl font-black mb-1">分享给好友</h2>
          <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">让更多孩子遇见好书</p>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-3xl shadow-inner border border-gray-50 mb-6">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-48 h-48 object-contain"
            />
          </div>

          <div className="w-full space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 break-all text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">预览链接</p>
              <p className="text-xs text-gray-600 font-medium line-clamp-2">{url}</p>
            </div>

            <button 
              onClick={copyToClipboard}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-copy"></i> 复制链接
            </button>
            
            <button 
              onClick={onClose}
              className="w-full py-3 text-gray-400 font-bold text-sm"
            >
              返回
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-[9px] text-gray-400 italic">扫码或复制链接均可访问本应用</p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
