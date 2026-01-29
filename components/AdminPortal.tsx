
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Resource } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  authorizedEmails: string[];
  setAuthorizedEmails: (emails: string[]) => void;
  currentDataset: Resource[];
  onUpdateDataset: (data: Resource[]) => void;
  onResetDataset: () => void;
  isCustomData: boolean;
}

const AdminPortal: React.FC<Props> = ({ 
  isOpen, onClose, isAdmin, setIsAdmin, 
  authorizedEmails, setAuthorizedEmails,
  currentDataset, onUpdateDataset, onResetDataset, isCustomData
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resourceImgInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorizedEmails.includes(emailInput.trim().toLowerCase()) && passwordInput === 'Hj65717643!') {
      setIsAdmin(true);
      setError('');
    } else {
      setError('认证失败');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    const isJson = file.name.endsWith('.json');

    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (!content) throw new Error("文件为空");

        let newItems: Resource[] = [];

        setTimeout(() => {
          try {
            if (isJson) {
              const jsonText = new TextDecoder().decode(content as ArrayBuffer);
              const parsed = JSON.parse(jsonText);
              const rawItems = Array.isArray(parsed) ? parsed : [parsed];
              
              newItems = rawItems.map((item: any): Resource => ({
                id: item.id || `res-${Math.random().toString(36).substr(2, 9)}`,
                title: item.title || item.名称 || item.书名 || '未命名',
                ageRange: item.ageRange || item.年纪 || '全龄',
                whyItsGood: item.whyItsGood || item.理由 || '',
                description: item.description || item.简介 || '',
                categories: Array.isArray(item.categories) ? item.categories : (item.分类 || '').split(/[,， ]/).filter(Boolean),
                type: (item.type === 'game' || String(item.类型).includes('桌游')) ? 'game' : 'book',
                image: item.image || `https://picsum.photos/seed/${encodeURIComponent(item.title || 'magic')}/400/500`
              }));
            } else {
              const data = new Uint8Array(content as ArrayBuffer);
              const wb = XLSX.read(data, { type: 'array' });
              let allRows: any[] = [];
              wb.SheetNames.forEach((sheetName) => {
                const sheetData = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
                if (sheetData.length > 0) allRows = allRows.concat(sheetData);
              });

              newItems = (allRows.map((row: any, i: number): Resource => ({
                id: `res-xls-${Date.now()}-${i}`,
                title: String(row['书名'] || row['名称'] || row['Title'] || '').trim(),
                ageRange: String(row['年纪'] || row['年龄'] || row['Age'] || '全龄').trim(),
                whyItsGood: String(row['理由'] || row['为什么'] || '').trim(),
                description: String(row['简介'] || row['描述'] || '').trim(),
                categories: String(row['分类'] || '').split(/[,， ]/).filter(Boolean),
                type: String(row['类型'] || '').includes('桌游') ? 'game' : 'book',
                image: `https://picsum.photos/seed/${encodeURIComponent(row['书名'] || i)}/400/500`
              }))).filter(item => item.title);
            }

            const datasetMap = new Map();
            if (isCustomData) currentDataset.forEach(d => datasetMap.set(d.title, d));
            newItems.forEach(item => datasetMap.set(item.title, item));
            
            onUpdateDataset(Array.from(datasetMap.values()));
            setIsProcessing(false);
            alert(`导入成功！共计 ${datasetMap.size} 条数据`);
          } catch (err: any) {
            alert(`解析出错: ${err.message}`);
            setIsProcessing(false);
          }
        }, 100);
      } catch (err: any) {
        setIsProcessing(false);
        alert(err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteResource = (id: string, title: string) => {
    if (window.confirm(`确定要从书库中永久删除《${title}》吗？此操作无法撤销。`)) {
      const updatedDataset = currentDataset.filter(item => item.id !== id);
      onUpdateDataset(updatedDataset);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {isProcessing && (
          <div className="absolute inset-0 z-[110] bg-white/90 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-indigo-900">正在处理大数据量，请稍候...</p>
          </div>
        )}

        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{editingResource ? '编辑资源' : '后台管理'}</h2>
            <p className="text-indigo-100 text-xs mt-1">
              {isAdmin ? '管理员权限已激活' : '请输入管理员凭据'}
            </p>
          </div>
          <button onClick={editingResource ? () => setEditingResource(null) : onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <i className={`fa-solid ${editingResource ? 'fa-arrow-left' : 'fa-xmark'}`}></i>
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh] no-scrollbar">
          {!isAdmin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="管理员邮箱" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none" required />
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="密码" className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none" required />
              <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">进入系统</button>
            </form>
          ) : editingResource ? (
            <div className="space-y-4">
               <div className="flex gap-4">
                  <img src={editingResource.image} className="w-24 h-32 object-cover rounded-xl shadow-md" />
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase px-1">书名/名称</label>
                    <input value={editingResource.title} onChange={e => setEditingResource({...editingResource, title: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm font-bold" />
                    <label className="text-[10px] font-black text-gray-400 uppercase px-1">图片地址</label>
                    <input value={editingResource.image} onChange={e => setEditingResource({...editingResource, image: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-[10px]" />
                  </div>
               </div>
               <label className="block text-[10px] font-black text-gray-400 uppercase px-1">详细简介</label>
               <textarea value={editingResource.description} onChange={e => setEditingResource({...editingResource, description: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl h-32 outline-none text-sm leading-relaxed" />
               <button onClick={() => { onUpdateDataset(currentDataset.map(d => d.id === editingResource.id ? editingResource : d)); setEditingResource(null); }} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">保存修改</button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .json" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="p-6 bg-yellow-400 text-indigo-900 rounded-3xl flex flex-col items-center hover:bg-yellow-500 transition-all">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2"></i>
                  <span className="font-black text-sm">上传 JSON/Excel</span>
                </button>
                <button onClick={onResetDataset} className="p-6 bg-red-50 text-red-500 rounded-3xl flex flex-col items-center hover:bg-red-100 transition-all">
                  <i className="fa-solid fa-rotate-left text-2xl mb-2"></i>
                  <span className="font-black text-sm">重置系统</span>
                </button>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex justify-between items-center px-1">
                  <span>库中数据预览 ({currentDataset.length})</span>
                  <span className="text-[8px] font-normal lowercase italic text-gray-300">显示前 50 项</span>
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                  {currentDataset.slice(0, 50).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-sm transition-all">
                      <img src={item.image} className="w-8 h-10 object-cover rounded shadow-sm" />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-800 truncate">{item.title}</div>
                        <div className="text-[9px] text-gray-400">{item.ageRange}</div>
                      </div>
                      <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingResource(item)} 
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteResource(item.id, item.title)} 
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="从书库删除"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {currentDataset.length > 50 && <p className="text-center text-[10px] text-gray-300 italic pt-2">... 及其他 {currentDataset.length - 50} 项资源</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
