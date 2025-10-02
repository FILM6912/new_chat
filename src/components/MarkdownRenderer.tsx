import { memo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = memo(({ content, className = '' }: MarkdownRendererProps) => {
  const { theme } = useTheme();

  const parseMarkdown = (text: string) => {
    // First handle code blocks with language specification
    text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || 'text';
      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
      return `<div class="code-block" data-language="${lang}" data-code="${encodeURIComponent(code.trim())}" data-id="${codeId}"></div>`;
    });

    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Convert `inline code` to <code>
    text = text.replace(/`([^`]+)`/g, `<code class="inline-code bg-opacity-50 px-2 py-1 rounded text-sm font-mono ${
      theme === 'dark' 
        ? 'bg-gray-700 text-gray-200' 
        : 'bg-gray-200 text-gray-800'
    }">$1</code>`);
    
    // Convert [link](url) to <a>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>`);
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    return text;
  };

  const renderContent = () => {
    const parsedContent = parseMarkdown(content);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = parsedContent;
    
    // Find all code blocks and replace them with syntax highlighted versions
    const codeBlocks = tempDiv.querySelectorAll('.code-block');
    codeBlocks.forEach((block) => {
      const language = block.getAttribute('data-language') || 'text';
      const code = decodeURIComponent(block.getAttribute('data-code') || '');
      const id = block.getAttribute('data-id');
      
      // Create a placeholder that will be replaced by React component
      block.outerHTML = `<div class="syntax-highlight" data-language="${language}" data-code="${encodeURIComponent(code)}" data-id="${id}"></div>`;
    });
    
    return tempDiv.innerHTML;
  };

  const processedContent = renderContent();

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <div
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      {/* Render syntax highlighted code blocks */}
      {content.match(/```(\w+)?\n?([\s\S]*?)```/g)?.map((match, index) => {
        const codeMatch = match.match(/```(\w+)?\n?([\s\S]*?)```/);
        if (!codeMatch) return null;
        const language = codeMatch[1] || 'text';
        const code = codeMatch[2].trim();
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        };
        return (
          <div key={index} className="my-4 relative group">
            <div className={`rounded-lg overflow-hidden border ${
              theme === 'dark' 
                ? 'border-gray-700/50 bg-gray-800/30' 
                : 'border-gray-200/50 bg-white/80'
            }`}>
              {/* Language label and copy button */}
              <div className={`px-4 py-2 text-xs font-mono border-b flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 text-gray-300'
                  : 'bg-gray-100/50 border-gray-200/50 text-gray-600'
              }`}>
                <span>{language}</span>
                <button
                  onClick={handleCopy}
                  className={`ml-2 p-2 rounded-full text-white shadow-lg border focus:outline-none focus:ring-2 transition-all duration-300 ${
                    copied ? 'scale-110' : ''
                  } ${
                    // ใช้สีเดียวกันสำหรับทั้ง user และ agent
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 border-emerald-400 focus:ring-emerald-400'
                      : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 border-emerald-300 focus:ring-emerald-400'
                  }`}
                  title="คัดลอกโค้ด"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s' }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {/* Code content */}
              <div style={{ position: 'relative' }} className="code-scrollbar">
                <SyntaxHighlighter
                  language={language}
                  style={theme === 'dark' ? {
                    'code[class*="language-"]': {
                      color: '#d4d4d4',
                      background: '#1e1e1e',
                      fontFamily: 'Consolas, "Fira Mono", "Menlo", monospace',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      borderRadius: '8px',
                      padding: '0',
                    },
                    'pre[class*="language-"]': {
                      color: '#d4d4d4',
                      background: '#1e1e1e',
                      fontFamily: 'Consolas, "Fira Mono", "Menlo", monospace',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      borderRadius: '8px',
                      margin: 0,
                      padding: 0,
                    },
                    'comment': { color: '#6a9955' },
                    'string': { color: '#ce9178' },
                    'number': { color: '#b5cea8' },
                    'keyword': { color: '#569cd6' },
                    'function': { color: '#dcdcaa' },
                    'variable': { color: '#9cdcfe' },
                    'operator': { color: '#d4d4d4' },
                    'punctuation': { color: '#d4d4d4' },
                    'builtin': { color: '#4ec9b0' },
                    'class-name': { color: '#4ec9b0' },
                    'tag': { color: '#569cd6' },
                    'attr-name': { color: '#9cdcfe' },
                    'property': { color: '#d7ba7d' },
                    'boolean': { color: '#569cd6' },
                    'constant': { color: '#4fc1ff' },
                  } : {
                    'code[class*="language-"]': {
                      color: '#383a42',
                      background: '#fafafa',
                      fontFamily: 'Consolas, "Fira Mono", "Menlo", monospace',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      borderRadius: '8px',
                      padding: '0',
                    },
                    'pre[class*="language-"]': {
                      color: '#383a42',
                      background: '#fafafa',
                      fontFamily: 'Consolas, "Fira Mono", "Menlo", monospace',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      borderRadius: '8px',
                      margin: 0,
                      padding: 0,
                    },
                    'comment': { color: '#a0a1a7' },
                    'string': { color: '#50a14f' },
                    'number': { color: '#986801' },
                    'keyword': { color: '#a626a4' },
                    'function': { color: '#4078f2' },
                    'variable': { color: '#e45649' },
                    'operator': { color: '#383a42' },
                    'punctuation': { color: '#383a42' },
                    'builtin': { color: '#0184bb' },
                    'class-name': { color: '#c18401' },
                    'tag': { color: '#e45649' },
                    'attr-name': { color: '#986801' },
                    'property': { color: '#4078f2' },
                    'boolean': { color: '#0184bb' },
                    'constant': { color: '#0184bb' },
                  }}
                  customStyle={{
                    margin: 0,
                    padding: '16px',
                    background: theme === 'dark' ? '#1e1e1e' : '#fafafa',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: 'Consolas, "Fira Mono", "Menlo", monospace',
                    borderRadius: '8px',
                    maxHeight: '400px',
                    overflow: 'auto',
                  }}
                  className="code-scrollbar"
                  showLineNumbers={code.split('\n').length > 3}
                  lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '0.5em', // move divider left
                    color: theme === 'dark' ? '#444d56' : '#9ca3af',
                    userSelect: 'none',
                    background: 'transparent',
                    fontFamily: 'Consolas, "Fira Mono", "Menlo", monospace',
                    borderRight: '2px solid ' + (theme === 'dark' ? '#444d56' : '#e5e7eb'),
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;

