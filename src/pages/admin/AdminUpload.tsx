import React, { useState, useMemo } from 'react';
import { db } from '../../lib/firebase/firebase';
import { writeBatch, doc, collection, setDoc, query, where, getDocs } from 'firebase/firestore';
import DashboardLayout from '../../layouts/DashboardLayout';

interface RawQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  rationale: string;
}

interface ValidatedQuestion extends RawQuestion {
  isValid: boolean;
  errors: string[];
}

const AdminUpload: React.FC = () => {
  const [courseSlug, setCourseSlug] = useState('');
  const [questions, setQuestions] = useState<ValidatedQuestion[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error('JSON must be an array');

        const validated = json.map((q: any) => {
          const errors: string[] = [];
          if (typeof q.question !== 'string' || !q.question) errors.push('question');
          if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o: any) => typeof o !== 'string')) errors.push('options');
          if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) errors.push('correctAnswer');
          if (typeof q.category !== 'string' || !q.category) errors.push('category');
          if (typeof q.rationale !== 'string' || !q.rationale) errors.push('rationale');

          return {
            ...q,
            isValid: errors.length === 0,
            errors
          };
        });

        setQuestions(validated);
        setSyncStatus(null);
      } catch (err) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const handleSync = async () => {
    if (!courseSlug) {
      alert('Please enter a course slug first');
      return;
    }
    if (questions.some(q => !q.isValid)) {
      alert('Please fix validation errors before syncing');
      return;
    }

    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      const questionsCol = collection(db, 'questions');

      questions.forEach((q) => {
        const newDocRef = doc(questionsCol);
        const { isValid, errors, ...cleanQuestion } = q;
        batch.set(newDocRef, {
          ...cleanQuestion,
          courseSlug: courseSlug.toLowerCase(),
          randomId: Math.random(),
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();

      await setDoc(doc(db, 'course_metadata', courseSlug.toLowerCase()), {
        totalQuestions: questions.length,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      setSyncStatus({ 
        type: 'success', 
        message: `Successfully uploaded ${questions.length} questions to ${courseSlug.toUpperCase()}` 
      });
      setQuestions([]);
      setCourseSlug('');
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncStatus({ type: 'error', message: 'Sync failed. Check console for details.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForceRefresh = async () => {
    if (!courseSlug) {
      alert('Please enter a course slug first');
      return;
    }
    setIsSyncing(true);
    try {
      const q = query(collection(db, 'questions'), where('courseSlug', '==', courseSlug.toLowerCase()));
      const snap = await getDocs(q);
      
      await setDoc(doc(db, 'course_metadata', courseSlug.toLowerCase()), {
        totalQuestions: snap.size,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      setSyncStatus({ 
        type: 'success', 
        message: `Refresh Complete: ${snap.size} documents counted for ${courseSlug.toUpperCase()}` 
      });
    } catch (err) {
      console.error('Refresh failed:', err);
      setSyncStatus({ type: 'error', message: 'Refresh failed.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const invalidCount = useMemo(() => questions.filter(q => !q.isValid).length, [questions]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-['Lora']">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-sm border border-[#adb3b4]/20 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-[#2a2d2e] mb-2">Question Uploader</h1>
            <p className="text-[11px] font-bold text-[#757c7d] uppercase tracking-[0.2em]">Bulk Sync to Firestore</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest">Course Slug</p>
              <input 
                type="text" 
                placeholder="e.g. csc201"
                value={courseSlug}
                onChange={(e) => setCourseSlug(e.target.value)}
                className="px-4 py-2 border border-[#adb3b4]/30 rounded-sm text-sm focus:border-[#d4aa37] outline-none transition-all"
              />
            </div>
            <label className="cursor-pointer bg-[#2a2d2e] text-white px-6 py-2.5 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#b32839] transition-all text-center">
              Upload JSON
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </header>

        {syncStatus && (
          <div className={`p-4 rounded-sm text-sm font-bold uppercase tracking-widest ${syncStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-[#b32839]'}`}>
            {syncStatus.message}
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-sm border border-[#adb3b4]/20 shadow-sm">
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-2xl font-black text-[#2a2d2e]">{questions.length}</p>
                  <p className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-widest">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{questions.length - invalidCount}</p>
                  <p className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-widest">Valid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-[#b32839]">{invalidCount}</p>
                  <p className="text-[9px] font-bold text-[#adb3b4] uppercase tracking-widest">Errors</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleForceRefresh}
                  className="px-6 py-4 bg-[#f2f4f4] text-[#757c7d] font-black text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-[#adb3b4]/20 transition-all"
                >
                  Force Refresh
                </button>
                <button 
                  onClick={handleSync}
                  disabled={isSyncing || invalidCount > 0 || !courseSlug}
                  className="px-10 py-4 bg-[#d4aa37] text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-sm hover:bg-[#2a2d2e] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSyncing ? 'Syncing...' : 'Confirm Sync'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-sm border border-[#adb3b4]/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f9f9f9] border-b border-[#adb3b4]/20">
                      <th className="p-4 text-[10px] font-bold text-[#757c7d] uppercase tracking-widest">Question</th>
                      <th className="p-4 text-[10px] font-bold text-[#757c7d] uppercase tracking-widest">Category</th>
                      <th className="p-4 text-[10px] font-bold text-[#757c7d] uppercase tracking-widest">Options</th>
                      <th className="p-4 text-[10px] font-bold text-[#757c7d] uppercase tracking-widest">Correct</th>
                      <th className="p-4 text-[10px] font-bold text-[#757c7d] uppercase tracking-widest">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f4f4]">
                    {questions.map((q, i) => (
                      <tr key={i} className={`text-xs hover:bg-[#fdfcf8] transition-colors ${!q.isValid ? 'bg-red-50/30' : ''}`}>
                        <td className={`p-4 font-medium min-w-[300px] ${q.errors.includes('question') ? 'text-[#b32839] font-bold' : 'text-[#2a2d2e]'}`}>
                          {q.question || 'MISSING'}
                        </td>
                        <td className={`p-4 ${q.errors.includes('category') ? 'text-[#b32839] font-bold' : 'text-[#5a6061]'}`}>
                          {q.category || 'MISSING'}
                        </td>
                        <td className={`p-4 ${q.errors.includes('options') ? 'text-[#b32839] font-bold' : 'text-[#5a6061]'}`}>
                          {q.options?.length || 0}/4
                        </td>
                        <td className={`p-4 font-bold ${q.errors.includes('correctAnswer') ? 'text-[#b32839]' : 'text-[#2a2d2e]'}`}>
                          {q.correctAnswer !== undefined ? q.correctAnswer : 'MISSING'}
                        </td>
                        <td className={`p-4 max-w-xs truncate ${q.errors.includes('rationale') ? 'text-[#b32839] font-bold' : 'text-[#757c7d]'}`}>
                          {q.rationale || 'MISSING'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUpload;
