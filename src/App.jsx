import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  FileText, 
  Upload, 
  ChevronRight, 
  Printer, 
  Loader2, 
  BrainCircuit,
  FileSearch,
  ClipboardCopy,
  Check,
  Info
} from 'lucide-react';

// ========================================================
// CONFIGURAÇÃO FIXA
// Substitua pela sua chave real entre as aspas
const MINHA_GEMINI_KEY = "AIzaSyDvkfhqPg6kdOTIFNTVj6jHpY4r9kiFMdM";
// ========================================================

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({
        inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setResult('');

    try {
      // Usa a chave fixa declarada acima
      const genAI = new GoogleGenerativeAI(MINHA_GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const pdfPart = await fileToGenerativePart(file);
      
      const prompt = "Analise este exame laboratorial. Extraia: Nome do exame e Valor obtido (preservando a vírgula). Formate estritamente em uma tabela Markdown organizada. Se houver valores fora do comum, adicione uma nota ao final.";
      
      const result = await model.generateContent([prompt, pdfPart]);
      setResult(result.response.text());
    } catch (e) {
      setResult(`## ❌ Erro na Análise\nOcorreu um problema ao processar o arquivo: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-slate-900 font-sans overflow-hidden">
      
      {/* SIDEBAR: CONTROLES */}
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <BrainCircuit size={26} strokeWidth={2.5} />
            <span className="font-black tracking-tight text-xl text-slate-900">LabAI<span className="text-indigo-600">.</span></span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Inteligência de Exames</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Upload Section */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-600">
              <Upload size={14} />
              <h3 className="text-[11px] font-black uppercase tracking-wider">Documento PDF</h3>
            </div>
            
            {!file ? (
              <div className="group border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer relative">
                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} />
                <FileSearch className="mx-auto text-slate-300 group-hover:text-indigo-500 transition-colors mb-2" size={32} />
                <p className="text-xs font-bold text-slate-500">Selecionar PDF</p>
              </div>
            ) : (
              <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl shadow-indigo-100 animate-in zoom-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><FileText size={20} /></div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black truncate">{file.name}</p>
                    <button onClick={() => setFile(null)} className="text-[10px] font-bold opacity-70 hover:opacity-100 uppercase tracking-tighter">Substituir</button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Info Status */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 animate-pulse shrink-0"></div>
            <div>
              <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider mb-1">Sistema Ativo</p>
              <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
                Conexão com Gemini estabelecida com sucesso.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-white">
          <button 
            onClick={handleProcess}
            disabled={loading || !file}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              loading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Iniciar Análise"}
            {!loading && <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        <header className="h-20 border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Monitor de Saída
            </h2>
          </div>
          
          {result && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-full transition-all border ${
                  copied 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
                {copied ? "Copiado!" : "Copiar Relatório"}
              </button>

              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-full transition-all"
              >
                <Printer size={14} /> Imprimir
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto py-12 px-6">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-3xl flex items-center justify-center mb-6">
                  <FileSearch className="text-slate-200" size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Pronto para Analisar</h3>
                <p className="text-slate-400 text-sm max-w-xs mt-2 font-medium">
                  Carregue um PDF de exames na barra lateral para extrair os dados.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <BrainCircuit className="text-indigo-600" size={32} />
                </div>
                <p className="mt-12 text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">
                  Interpretando Linguagem Médica...
                </p>
              </div>
            )}

            {result && (
              <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-3xl p-8 md:p-12 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <article className="prose prose-indigo max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-black
                  prose-table:border-collapse prose-table:my-8
                  prose-th:bg-slate-900 prose-th:text-white prose-th:font-black prose-th:text-[10px] prose-th:uppercase prose-th:tracking-widest prose-th:p-4 prose-th:border-none prose-th:first:rounded-l-xl prose-th:last:rounded-r-xl
                  prose-td:p-4 prose-td:text-sm prose-td:font-medium prose-td:border-b prose-td:border-slate-100 prose-tr:hover:bg-indigo-50/40 transition-colors">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}