import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeBaseItem, addKnowledgeBaseItem, updateKnowledgeBaseItem } from '@core/data/mockDB';
import Dropdown from '@ui/Dropdown';
import { Bold, Italic, List } from 'lucide-react';

type FaqFormData = Omit<KnowledgeBaseItem, 'id'>;

interface FaqItemFormProps {
  initialData?: KnowledgeBaseItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Simple markdown renderer for preview
const renderMarkdown = (markdownText: string) => {
  if (!markdownText) return '';
  const lines = markdownText.split('\n');
  let html = '';
  let inList = false;

  lines.forEach(line => {
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');

    if (line.trim().startsWith('- ')) {
      const listItemContent = line.trim().substring(2);
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${listItemContent}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (line.trim() !== '') {
        html += `<p>${line}</p>`;
      } else {
        if (html.endsWith('</p>')) {
          html += '<br />';
        }
      }
    }
  });

  if (inList) {
    html += '</ul>';
  }
  return html;
};


const FaqItemForm: React.FC<FaqItemFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const defaultState: FaqFormData = {
    question: '',
    answer: '',
    category: 'Operasional',
  };

  const [formData, setFormData] = useState<FaqFormData>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        question: initialData.question,
        answer: initialData.answer,
        category: initialData.category,
      });
    } else {
      setFormData(defaultState);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: FaqFormData['category']) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleToolbarClick = (syntax: 'bold' | 'italic' | 'list') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let newText;

    if (syntax === 'list') {
      let lineStart = start;
      while (lineStart > 0 && text[lineStart - 1] !== '\n') {
        lineStart--;
      }
      const prefix = text.substring(0, lineStart) + '- ';
      newText = prefix + text.substring(lineStart);
      setFormData(prev => ({ ...prev, answer: newText }));
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else {
      const [prefix, suffix] = syntax === 'bold' ? ['**', '**'] : ['*', '*'];
      newText = `${prefix}${selectedText || ''}${suffix}`;

      const updatedAnswer = text.substring(0, start) + newText + text.substring(end);
      setFormData(prev => ({ ...prev, answer: updatedAnswer }));

      setTimeout(() => {
        textarea.focus();
        if (selectedText) {
          textarea.selectionStart = start + prefix.length;
          textarea.selectionEnd = end + prefix.length;
        } else {
          textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
        }
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateKnowledgeBaseItem(initialData.id, formData);
      } else {
        await addKnowledgeBaseItem(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save FAQ item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full shadow-sm py-3 px-4 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const labelClasses = "block text-sm font-medium text-brand-secondary dark:text-gray-400 mb-1";
  const editorTextareaClasses = "block w-full shadow-inner py-3 px-4 border border-gray-300 rounded-b-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="question" className={labelClasses}>Pertanyaan</label>
        <textarea name="question" id="question" required rows={2} value={formData.question} onChange={handleChange} className={inputClasses}></textarea>
      </div>
      <div>
        <label htmlFor="answer" className={labelClasses}>Jawaban (mendukung Markdown)</label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="flex items-center border-b border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => handleToolbarClick('bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><Bold size={16} /></button>
              <button type="button" onClick={() => handleToolbarClick('italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><Italic size={16} /></button>
              <button type="button" onClick={() => handleToolbarClick('list')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><List size={16} /></button>
            </div>
            <div className="flex-grow"></div>
            <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-900/50 rounded-lg">
              <button type="button" onClick={() => setEditorTab('write')} className={`px-3 py-1 rounded-md text-sm font-medium ${editorTab === 'write' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}>Tulis</button>
              <button type="button" onClick={() => setEditorTab('preview')} className={`px-3 py-1 rounded-md text-sm font-medium ${editorTab === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}>Pratinjau</button>
            </div>
          </div>
          {editorTab === 'write' ? (
            <textarea ref={textareaRef} name="answer" id="answer" required rows={4} value={formData.answer} onChange={handleChange} className={`${editorTextareaClasses} rounded-t-none`}></textarea>
          ) : (
            <div
              className="markdown-preview p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg min-h-[148px]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.answer) || '<p class="text-gray-400 italic">Pratinjau akan muncul di sini...</p>' }}
            />
          )}
        </div>
      </div>
      <div>
        <label htmlFor="category" className={labelClasses}>Kategori</label>
        <Dropdown
          id="category"
          options={['Operasional', 'Menu', 'Pembayaran', 'Promo']}
          value={formData.category}
          onChange={handleCategoryChange}
        />
      </div>
      <div className="pt-4 flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-full text-brand-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-600">Batal</button>
        <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400">
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};

export default FaqItemForm;