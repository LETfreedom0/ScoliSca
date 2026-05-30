'use client';

import { useState, useEffect, useCallback } from 'react';
import { AI_PROVIDERS, getProviderById } from '@/lib/ai-models';

interface FileItem {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

interface AnalysisResult {
  riskLevel: string;
  shoulderBalance: string;
  pelvicTilt: string;
  spineContour: string;
  cobbAngle: number;
  recommendations: string[];
  summary: string;
}

interface AppConfig {
  r2: {
    accountId: string;
    bucketName: string;
    publicDomain: string;
  };
  ai: {
    provider: string;
    model: string;
    defaultPrompt: string;
  };
}

const TABS = [
  { id: 'files', label: '文件管理', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', description: '上传和管理图片文件' },
  { id: 'analyze', label: 'AI 分析', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', description: 'AI 脊柱侧弯分析' },
  { id: 'prompt', label: '提示词配置', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', description: '配置 AI 分析提示词' },
  { id: 'api', label: 'API 管理', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', description: 'API 接口文档和测试' },
  { id: 'r2-config', label: 'R2 配置', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79 8-4', description: '配置 R2 对象存储' },
  { id: 'ai-config', label: 'AI 配置', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', description: '配置 AI 提供商和模型' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'files' | 'analyze' | 'prompt' | 'api' | 'r2-config' | 'ai-config'>('files');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [filterDays, setFilterDays] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageType, setImageType] = useState<'photo' | 'xray'>('photo');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [r2Form, setR2Form] = useState({ accountId: '', bucketName: '', publicDomain: '' });
  const [aiForm, setAiForm] = useState({ provider: 'openai', model: 'gpt-4o', apiKey: '' });
  const [promptForm, setPromptForm] = useState({ prompt: '' });
  const [r2CredsForm, setR2CredsForm] = useState({ accessKeyId: '', secretAccessKey: '' });
  const [r2Stats, setR2Stats] = useState<{ count: number; totalSize: number; totalSizeFormatted: string } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      showToast('error', '复制失败');
    }
  };

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setR2Form(data.data.r2);
        setAiForm({ ...data.data.ai, apiKey: '' });
        setPromptForm({ prompt: data.data.ai.defaultPrompt });
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  }, []);

  const fetchR2Stats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/files/stats');
      const data = await res.json();
      if (data.success) {
        setR2Stats(data.data);
      }
    } catch (error) {
      showToast('error', '获取统计信息失败');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/files/list?prefix=uploads/');
      const data = await res.json();
      if (data.success) {
        setFiles(data.data);
      }
    } catch (error) {
      showToast('error', '获取文件列表失败');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'files') {
      fetchFiles();
    }
    if (activeTab === 'prompt' || activeTab === 'r2-config' || activeTab === 'ai-config') {
      fetchConfig();
    }
    if (activeTab === 'r2-config') {
      fetchR2Stats();
    }
  }, [activeTab, fetchFiles, fetchConfig, fetchR2Stats]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', '上传成功！');
        fetchFiles();
        if (data.data.url) {
          setImageUrl(data.data.url);
          setSelectedFile({
            key: data.data.key,
            url: data.data.url,
            size: data.data.size,
            lastModified: new Date().toISOString(),
          });
        }
      } else {
        showToast('error', data.error || '上传失败');
      }
    } catch (error) {
      showToast('error', '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    try {
      const res = await fetch(`/api/files/delete?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', '删除成功');
        fetchFiles();
        if (selectedFile?.key === key) setSelectedFile(null);
        setSelectedFiles(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        showToast('error', data.error || '删除失败');
      }
    } catch (error) {
      showToast('error', '删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) {
      showToast('error', '请先选择要删除的文件');
      return;
    }
    if (!confirm(`确定要删除选中的 ${selectedFiles.size} 个文件吗？`)) return;

    setDeleting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const key of Array.from(selectedFiles)) {
        try {
          const res = await fetch(`/api/files/delete?key=${encodeURIComponent(key)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) successCount++;
          else failCount++;
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        showToast('success', `成功删除 ${successCount} 个文件${failCount > 0 ? `，${failCount} 个失败` : ''}`);
      }
      if (failCount > 0 && successCount === 0) {
        showToast('error', '删除失败');
      }

      fetchFiles();
      setSelectedFiles(new Set());
      setSelectedFile(null);
    } catch (error) {
      showToast('error', '批量删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const toggleFileSelection = (key: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    const filteredFiles = getFilteredFiles();
    setSelectedFiles(new Set(filteredFiles.map(f => f.key)));
  };

  const clearSelection = () => setSelectedFiles(new Set());

  const getFilteredFiles = () => {
    if (!filterDays) return files;
    const cutoffTime = Date.now() - filterDays * 24 * 60 * 60 * 1000;
    return files.filter(f => new Date(f.lastModified).getTime() < cutoffTime);
  };

  const selectByDays = (days: number) => {
    setFilterDays(days);
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const oldFiles = files.filter(f => new Date(f.lastModified).getTime() < cutoffTime);
    setSelectedFiles(new Set(oldFiles.map(f => f.key)));
  };

  const handleAnalyze = async () => {
    if (!imageUrl && !selectedFile) {
      showToast('error', '请先上传图片或选择一个文件');
      return;
    }
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl || selectedFile?.url, imageType }),
      });
      const data = await res.json();
      if (data.success) setAnalysisResult(data.data);
      else showToast('error', data.error || '分析失败');
    } catch (error) {
      showToast('error', '分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveR2 = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateR2', ...r2Form }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'R2 配置已保存');
        fetchConfig();
      } else {
        showToast('error', data.error || '保存失败');
      }
    } catch (error) {
      showToast('error', '保存失败');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveAI = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateAI', ...aiForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'AI 配置已保存');
        fetchConfig();
      } else {
        showToast('error', data.error || '保存失败');
      }
    } catch (error) {
      showToast('error', '保存失败');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSavePrompt = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updatePrompt', prompt: promptForm.prompt }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', '提示词已保存');
        fetchConfig();
      } else {
        showToast('error', data.error || '保存失败');
      }
    } catch (error) {
      showToast('error', '保存失败');
    } finally {
      setSavingConfig(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-sm ${
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">ScoliSca 管理后台</h1>
                <p className="text-sm text-slate-400">脊柱筛查数据管理中心</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-700/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setActiveTab('files')} className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-slate-400 hover:text-white transition-colors">首页</span>
              </button>
              
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(activeTab === 'files' ? 'files' : activeTab === 'analyze' ? 'files' : 'files')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <svg className={`w-4 h-4 ${activeTab === 'files' ? 'text-teal-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TABS.find(t => t.id === 'files')!.icon} />
                  </svg>
                  <span className={`${activeTab === 'files' ? 'text-teal-400 font-medium' : 'text-slate-400 hover:text-white'} transition-colors`}>
                    {TABS.find(t => t.id === 'files')!.label}
                  </span>
                </button>
                
                {activeTab !== 'files' && (
                  <>
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentTab!.icon} />
                      </svg>
                      <span className="text-teal-400 font-medium">{currentTab!.label}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {activeTab === 'files' && (
                <span className="px-3 py-1 text-xs font-medium bg-teal-500/20 text-teal-400 rounded-full">
                  {files.length} 个文件
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">上传文件</h2>
                <label className="relative block">
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
                  <div className={`border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
                    uploading ? 'border-teal-400/50 bg-teal-500/5' : 'border-slate-600 hover:border-teal-400/70 hover:bg-slate-700/30'
                  }`}>
                    <div className="p-12 text-center">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                          <p className="text-slate-400">上传中...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-700/50 flex items-center justify-center">
                            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-slate-300 font-medium">点击或拖拽文件到此处上传</p>
                          <p className="text-sm text-slate-500 mt-1">支持 JPG、PNG、WebP，最大 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </label>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-400">最近上传</h3>
                    <div className="flex items-center gap-2">
                      {selectedFiles.size > 0 && <span className="text-xs text-teal-400">已选 {selectedFiles.size} 个</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <button onClick={() => selectByDays(7)} className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:bg-slate-600/50 transition-colors">选7天前</button>
                    <button onClick={() => selectByDays(30)} className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:bg-slate-600/50 transition-colors">选30天前</button>
                    <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:bg-slate-600/50 transition-colors">全选</button>
                    <button onClick={clearSelection} className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:bg-slate-600/50 transition-colors">取消选择</button>
                    {selectedFiles.size > 0 && (
                      <button onClick={handleBatchDelete} disabled={deleting} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-xs text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors flex items-center gap-1">
                        {deleting ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                        删除选中
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {files.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        <p>暂无文件</p>
                      </div>
                    ) : (
                      files.map((file) => (
                        <div key={file.key} className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${selectedFile?.key === file.key ? 'bg-teal-500/20 border border-teal-500/30' : selectedFiles.has(file.key) ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'}`}>
                          <input type="checkbox" checked={selectedFiles.has(file.key)} onChange={() => toggleFileSelection(file.key)} className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-teal-500 focus:ring-teal-500 cursor-pointer" />
                          <div onClick={() => setSelectedFile(file)} className="flex-1 flex items-center gap-3 cursor-pointer min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-600/50 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-200 truncate">{file.key.split('/').pop()}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                                <p className="text-xs text-slate-600">{new Date(file.lastModified).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(file.key); }} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all duration-200">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-white mb-4">文件预览</h2>
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-700/50">
                      <img src={selectedFile.url} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">文件名</span>
                        <span className="text-slate-200 truncate ml-2">{selectedFile.key.split('/').pop()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">大小</span>
                        <span className="text-slate-200">{formatSize(selectedFile.size)}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-700/50">
                        <label className="block text-xs text-slate-500 mb-2">访问 URL</label>
                        <div className="flex gap-2">
                          <input type="text" readOnly value={selectedFile.url} className="flex-1 px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-mono truncate" />
                          <button onClick={() => copyToClipboard(selectedFile.url)} className={`px-3 py-2 rounded-lg transition-all duration-200 ${copiedUrl === selectedFile.url ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50'}`}>
                            {copiedUrl === selectedFile.url ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setImageUrl(selectedFile.url); setActiveTab('analyze'); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        AI 分析
                      </button>
                      <button onClick={() => { setImageUrl(selectedFile.url); setActiveTab('r2-config'); }} className="flex-1 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-600/50 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.065c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                        配置
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-slate-700/30 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-slate-500 text-sm">选择一个文件预览</p>
                      <p className="text-xs text-slate-600 mt-1">或上传新图片</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">图片分析</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">图片 URL</label>
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="输入图片URL或使用左侧已上传的图片" className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">图片类型</label>
                  <select
                    value={imageType}
                    onChange={(e) => setImageType(e.target.value as 'photo' | 'xray')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="photo">后背照片</option>
                    <option value="xray">X光片</option>
                  </select>
                </div>
                <button onClick={handleAnalyze} disabled={analyzing || (!imageUrl && !selectedFile)} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
                  {analyzing ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />分析中...</> : <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>开始 AI 分析</>}
                </button>
              </div>
              {files.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-3">快速选择已上传文件：</p>
                  <div className="flex flex-wrap gap-2">
                    {files.slice(0, 4).map((file) => (
                      <button key={file.key} onClick={() => setImageUrl(file.url)} className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${imageUrl === file.url ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}>
                        {file.key.split('/').pop()?.substring(0, 15)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">分析结果</h2>
              {analysisResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">风险等级</span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getRiskColor(analysisResult.riskLevel)}`}>
                      {analysisResult.riskLevel === 'low' ? '低风险' : analysisResult.riskLevel === 'medium' ? '中风险' : '高风险'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-700/30"><p className="text-xs text-slate-500 mb-1">肩部平衡</p><p className="text-slate-200 font-medium">{analysisResult.shoulderBalance}</p></div>
                    <div className="p-4 rounded-xl bg-slate-700/30"><p className="text-xs text-slate-500 mb-1">骨盆状态</p><p className="text-slate-200 font-medium">{analysisResult.pelvicTilt}</p></div>
                    <div className="p-4 rounded-xl bg-slate-700/30"><p className="text-xs text-slate-500 mb-1">脊柱轮廓</p><p className="text-slate-200 font-medium">{analysisResult.spineContour}</p></div>
                    <div className="p-4 rounded-xl bg-slate-700/30"><p className="text-xs text-slate-500 mb-1">Cobb 角度</p><p className="text-slate-200 font-medium">{analysisResult.cobbAngle}°</p></div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20"><p className="text-sm text-slate-300">{analysisResult.summary}</p></div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2">建议</p>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-slate-700/30 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <p className="text-slate-500">上传图片并点击分析</p>
                    <p className="text-sm text-slate-600 mt-1">AI 将评估脊柱侧弯风险</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">提示词配置</h2>
                    <p className="text-sm text-slate-400 mt-1">自定义 AI 脊柱侧弯分析的提示词模板</p>
                  </div>
                </div>
                <span className="px-4 py-2 text-sm font-medium bg-emerald-500/20 text-emerald-400 rounded-full">核心配置</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-slate-200 mb-3">AI 分析提示词模板</label>
                  <textarea 
                    value={promptForm.prompt} 
                    onChange={(e) => setPromptForm({ prompt: e.target.value })} 
                    rows={16} 
                    className="w-full px-5 py-4 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none font-mono text-sm leading-relaxed"
                    placeholder="输入提示词模板..."
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={handleSavePrompt} 
                    disabled={savingConfig} 
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                  >
                    {savingConfig ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        保存提示词
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setPromptForm({ prompt: config?.ai.defaultPrompt || '' })} 
                    className="px-8 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 font-medium hover:bg-slate-600/50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    重置为默认
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">API 接口文档</h2>
                    <p className="text-sm text-slate-400 mt-1">ScoliSca 后端 API 接口说明</p>
                  </div>
                </div>
                <span className="px-4 py-2 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full">开发文档</span>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded">GET</span>
                    <code className="text-sm text-slate-200 font-mono">/api/files/list</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">获取文件列表</p>
                  <div className="text-xs text-slate-500">
                    <p className="font-medium text-slate-400 mb-1">参数：</p>
                    <code className="block pl-3">prefix: string (可选，默认 "uploads/")</code>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">POST</span>
                    <code className="text-sm text-slate-200 font-mono">/api/files/upload</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">上传文件到 R2 存储</p>
                  <div className="text-xs text-slate-500">
                    <p className="font-medium text-slate-400 mb-1">参数：</p>
                    <code className="block pl-3">file: File (multipart/form-data)</code>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded">DELETE</span>
                    <code className="text-sm text-slate-200 font-mono">/api/files/delete</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">删除 R2 存储中的文件</p>
                  <div className="text-xs text-slate-500">
                    <p className="font-medium text-slate-400 mb-1">参数：</p>
                    <code className="block pl-3">key: string (文件路径)</code>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded">GET</span>
                    <code className="text-sm text-slate-200 font-mono">/api/files/stats</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">获取 R2 存储统计信息</p>
                  <div className="text-xs text-slate-500">
                    <p className="font-medium text-slate-400 mb-1">返回：</p>
                    <code className="block pl-3">count: number (图片数量)</code>
                    <code className="block pl-3">totalSize: number (总大小)</code>
                    <code className="block pl-3">totalSizeFormatted: string (格式化大小)</code>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">POST</span>
                    <code className="text-sm text-slate-200 font-mono">/api/analyze</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">AI 图像分析接口</p>
                  <div className="text-xs text-slate-500">
                    <p className="font-medium text-slate-400 mb-1">参数：</p>
                    <code className="block pl-3">image: string (图片 URL 或 Base64)</code>
                    <code className="block pl-3">imageType: string (可选，photo 或 xray)</code>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">GET/POST</span>
                    <code className="text-sm text-slate-200 font-mono">/api/config</code>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">运行时配置管理</p>
                  <div className="text-xs text-slate-500">
                    <p className="font-medium text-slate-400 mb-1">GET 返回：</p>
                    <code className="block pl-3">r2: R2配置对象</code>
                    <code className="block pl-3">ai: AI配置对象</code>
                    <p className="font-medium text-slate-400 mb-1 mt-2">POST 操作：</p>
                    <code className="block pl-3">action: updateR2 | updateAI | updatePrompt</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">API 测试</h2>
                  <p className="text-sm text-slate-400 mt-1">测试后端 API 接口</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/files/stats');
                      const data = await res.json();
                      showToast('success', `存储统计：${data.data?.count ?? 0} 张图片`);
                    } catch {
                      showToast('error', 'API 测试失败');
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  测试存储统计 API
                </button>
                
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/files/list?prefix=uploads/');
                      const data = await res.json();
                      showToast('success', `文件列表：${data.data?.length ?? 0} 个文件`);
                    } catch {
                      showToast('error', 'API 测试失败');
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 font-medium hover:bg-slate-600/50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  测试文件列表 API
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'r2-config' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79 8-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">R2 存储配置</h2>
                    <p className="text-sm text-slate-400 mt-1">配置 Cloudflare R2 对象存储</p>
                  </div>
                </div>
                <span className="px-4 py-2 text-sm font-medium bg-orange-500/20 text-orange-400 rounded-full">存储配置</span>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cloudflare Account ID</label>
                    <input 
                      type="text" 
                      value={r2Form.accountId} 
                      onChange={(e) => setR2Form({ ...r2Form, accountId: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bucket 名称</label>
                    <input 
                      type="text" 
                      value={r2Form.bucketName} 
                      onChange={(e) => setR2Form({ ...r2Form, bucketName: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">公共域名</label>
                    <input 
                      type="text" 
                      value={r2Form.publicDomain} 
                      onChange={(e) => setR2Form({ ...r2Form, publicDomain: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-medium text-slate-200 mb-4">存储统计</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79 8-4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-orange-400">图片数量</p>
                          <p className="text-3xl font-bold text-white">
                            {statsLoading ? <span className="inline-block w-12 h-6 bg-slate-600 rounded animate-pulse" /> : r2Stats?.count ?? '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-teal-400">占用空间</p>
                          <p className="text-3xl font-bold text-white">
                            {statsLoading ? <span className="inline-block w-20 h-6 bg-slate-600 rounded animate-pulse" /> : r2Stats?.totalSizeFormatted ?? '0 B'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={fetchR2Stats} 
                    disabled={statsLoading} 
                    className="mt-4 px-6 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-400 text-sm hover:bg-slate-600/50 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {statsLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        刷新中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        刷新统计
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-medium text-slate-200 mb-4">访问凭证</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Access Key ID</label>
                      <input 
                        type="password" 
                        value={r2CredsForm.accessKeyId} 
                        onChange={(e) => setR2CredsForm({ ...r2CredsForm, accessKeyId: e.target.value })} 
                        placeholder="临时测试用，建议使用环境变量"
                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Secret Access Key</label>
                      <input 
                        type="password" 
                        value={r2CredsForm.secretAccessKey} 
                        onChange={(e) => setR2CredsForm({ ...r2CredsForm, secretAccessKey: e.target.value })} 
                        placeholder="临时测试用，建议使用环境变量"
                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveR2} 
                    disabled={savingConfig} 
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {savingConfig ? '保存中...' : '保存 R2 配置'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-config' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">AI 模型配置</h2>
                    <p className="text-sm text-slate-400 mt-1">配置 AI 提供商和模型参数</p>
                  </div>
                </div>
                <span className="px-4 py-2 text-sm font-medium bg-purple-500/20 text-purple-400 rounded-full">AI 配置</span>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">AI 提供商</label>
                    <select
                      value={aiForm.provider}
                      onChange={(e) => {
                        const newProvider = e.target.value;
                        const provider = getProviderById(newProvider);
                        setAiForm({
                          ...aiForm,
                          provider: newProvider,
                          model: provider?.models[0]?.id || ''
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      {AI_PROVIDERS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">模型名称</label>
                    <select
                      value={aiForm.model}
                      onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      {(getProviderById(aiForm.provider)?.models || []).map(m => (
                        <option key={m.id} value={m.id}>{m.name} - {m.description}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">API Key（留空则使用环境变量）</label>
                  <input 
                    type="password" 
                    value={aiForm.apiKey} 
                    onChange={(e) => setAiForm({ ...aiForm, apiKey: e.target.value })} 
                    placeholder="临时测试用，建议使用环境变量配置"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-2">提示：推荐将 API Key 配置在 .env.local 文件中更安全</p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveAI} 
                    disabled={savingConfig} 
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {savingConfig ? '保存中...' : '保存 AI 配置'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}