import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPriceList, uploadPriceList } from '@/services/mockApi';
import type { PriceListFile } from '@/types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} م.ب`;
}

export default function PriceListManagement() {
  const [currentFile, setCurrentFile] = useState<PriceListFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async () => {
    setLoading(true);
    const file = await getPriceList();
    setCurrentFile(file);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const handleFile = async (file: File) => {
    setError('');
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('يُسمح فقط بملفات .docx');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadPriceList(file);
      setCurrentFile(uploaded);
    } catch {
      setError('فشل رفع الملف. حاول مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-bold text-lg text-[#18181B]">إدارة قائمة الأسعار</h3>
        <p className="font-body text-sm text-slate mt-1">ارفع ملف Word (.docx) لعرضه في صفحة قائمة الأسعار العامة</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20 text-error font-body text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {currentFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-steel-light rounded-xl p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-ignition-start/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-ignition-start" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#18181B]">{currentFile.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span className="font-body text-xs text-slate">
                    تاريخ الرفع: {new Date(currentFile.uploadDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="font-body text-xs text-slate">
                    الحجم: {formatFileSize(currentFile.size)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-ignition-start text-ignition-start font-body text-sm font-medium hover:bg-ignition-start/5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
              استبدال الملف
            </button>
          </div>
        </motion.div>
      )}

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`bg-white border-2 border-dashed rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-colors duration-200 ${
          dragActive
            ? 'border-ignition-start bg-ignition-start/5'
            : 'border-steel-dark/30 hover:border-ignition-start/50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <div className="w-10 h-10 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-steel-light flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#18181B]" />
            </div>
          )}
          <div>
            <p className="font-heading font-bold text-[#18181B]">
              {currentFile ? 'اسحب ملفاً جديداً أو انقر للاستبدال' : 'اسحب ملف .docx هنا أو انقر للرفع'}
            </p>
            <p className="font-body text-sm text-slate mt-1">الصيغة المدعومة: .docx فقط</p>
          </div>
        </div>
      </div>
    </div>
  );
}
