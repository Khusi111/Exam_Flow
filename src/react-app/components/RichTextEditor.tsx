import { useState, useRef } from 'react';
import { Bold, Italic, List, Image, Calculator, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text here...", 
  className = "",
  label 
}: RichTextEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEquationModal, setShowEquationModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [equation, setEquation] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleOrderedList = () => {
    insertText('\n1. ');
  };

  const handleEquation = () => {
    if (equation.trim()) {
      insertText(`$$${equation}$$`);
      setEquation('');
      setShowEquationModal(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    insertText(`![Image](${imageUrl})`);
    setShowImageModal(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="border border-slate-300 rounded-t-lg bg-slate-50 p-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Basic formatting */}
          <button
            type="button"
            onClick={handleBold}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleItalic}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleOrderedList}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Ordered List"
          >
            <List className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300"></div>

          {/* Advanced tools */}
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Import Image"
          >
            <Image className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => setShowEquationModal(true)}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Equation Editor"
          >
            <Calculator className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300"></div>

          {/* Advanced dropdown toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-200 rounded transition-colors text-sm"
          >
            Advanced
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Advanced tools panel */}
        {showAdvanced && (
          <div className="mt-2 pt-2 border-t border-slate-300">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Advanced formatting tools will appear here</span>
            </div>
          </div>
        )}
      </div>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-32 px-3 py-2 border border-slate-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
      />

      {/* Equation Modal */}
      {showEquationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Equation</h3>
            <div className="space-y-4">
              {/* Symbol Toolbar */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Mathematical Symbols</h4>
                
                {/* Basic Operations */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Basic Operations</p>
                  <div className="flex flex-wrap gap-1">
                    {['+', '-', '\\times', '\\div', '\\pm', '\\mp', '\\cdot', '\\ast'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Relations */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Relations</p>
                  <div className="flex flex-wrap gap-1">
                    {['=', '\\neq', '<', '>', '\\leq', '\\geq', '\\ll', '\\gg', '\\approx', '\\equiv', '\\propto'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Greek Letters */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Greek Letters</p>
                  <div className="flex flex-wrap gap-1">
                    {['\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\theta', '\\lambda', '\\mu', '\\pi', '\\sigma', '\\tau', '\\phi', '\\chi', '\\psi', '\\omega'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculus & Analysis */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Calculus & Analysis</p>
                  <div className="flex flex-wrap gap-1">
                    {['\\int', '\\iint', '\\iiint', '\\oint', '\\sum', '\\prod', '\\lim', '\\infty', '\\partial', '\\nabla'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fractions & Powers */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Fractions & Powers</p>
                  <div className="flex flex-wrap gap-1">
                    {['\\frac{a}{b}', 'x^{y}', 'x_{y}', '\\sqrt{x}', '\\sqrt[n]{x}', 'x^2', 'x^3', 'x^n'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brackets */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Brackets</p>
                  <div className="flex flex-wrap gap-1">
                    {['()', '[]', '\\{\\}', '\\langle\\rangle', '\\left(\\right)', '\\left[\\right]', '\\left\\{\\right\\}'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Functions */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Functions</p>
                  <div className="flex flex-wrap gap-1">
                    {['\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\exp', '\\sinh', '\\cosh', '\\tanh'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arrows */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Arrows</p>
                  <div className="flex flex-wrap gap-1">
                    {['\\rightarrow', '\\leftarrow', '\\leftrightarrow', '\\Rightarrow', '\\Leftarrow', '\\Leftrightarrow', '\\uparrow', '\\downarrow'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sets */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Sets</p>
                  <div className="flex flex-wrap gap-1">
                    {['\\in', '\\notin', '\\subset', '\\supset', '\\subseteq', '\\supseteq', '\\cup', '\\cap', '\\emptyset', '\\mathbb{R}', '\\mathbb{N}', '\\mathbb{Z}', '\\mathbb{Q}'].map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setEquation(prev => prev + symbol + ' ')}
                        className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors text-sm font-mono"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  LaTeX Expression
                </label>
                <textarea
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  placeholder="e.g., x^2 + y^2 = r^2"
                  className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEquation('')}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setEquation('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors text-sm"
                  >
                    Quadratic Formula
                  </button>
                  <button
                    onClick={() => setEquation('\\int_{a}^{b} f(x) \\, dx')}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors text-sm"
                  >
                    Integral
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-slate-600">
                Preview: <span className="font-mono bg-slate-100 px-2 py-1 rounded break-all">{equation || 'x^2 + y^2 = r^2'}</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleEquation}
                  disabled={!equation.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert Equation
                </button>
                <button
                  onClick={() => {
                    setShowEquationModal(false);
                    setEquation('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Import Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleImageUpload(e.currentTarget.value.trim());
                    }
                  }}
                />
              </div>
              <div className="text-center text-slate-500 text-sm">or</div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                <input type="file" className="hidden" accept="image/*" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
