
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark.css'; // Or your preferred highlight.js theme

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content.includes('```mermaid')) {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      try {
        mermaid.contentLoaded();
      } catch (e) {
        console.error("Mermaid error on contentLoaded:", e);
      }
    }
  }, [content]);
  
  useEffect(() => {
    // This effect runs after each render to ensure Mermaid diagrams are processed
    // if they appear in the content.
    if (mermaidRef.current) {
      const mermaidElements = mermaidRef.current.querySelectorAll('.language-mermaid');
      mermaidElements.forEach((element) => {
        try {
          // Check if already processed to avoid errors
          if (!element.getAttribute('data-processed')) {
             mermaid.render(
              `mermaid-svg-${Math.random().toString(36).substring(7)}`,
              element.textContent || '',
              (svgCode) => {
                element.innerHTML = svgCode;
                element.setAttribute('data-processed', 'true');
              }
            );
          }
        } catch (e) {
          console.error('Error rendering Mermaid diagram:', e, element.textContent);
          element.innerHTML = `<pre>Error rendering diagram: ${(e as Error).message}</pre>`;

        }
      });
    }
  });


  return (
    <div ref={mermaidRef} className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Customize heading rendering if needed
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2" {...props} />,
          // Customize code block rendering
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (match && match[1] === 'mermaid') {
              return <div className="language-mermaid">{String(children)}</div>;
            }
            return match ? (
              <pre className="bg-gray-800 dark:bg-gray-900 text-white p-3 rounded-md overflow-x-auto my-2">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm text-sm" {...props}>
                {children}
              </code>
            );
          },
          // Add more custom components as needed
          // For example, for tables:
          table: ({node, ...props}) => <table className="table-auto w-full my-2 border-collapse border border-gray-300 dark:border-gray-600" {...props} />,
          thead: ({node, ...props}) => <thead className="bg-gray-100 dark:bg-gray-700" {...props} />,
          th: ({node, ...props}) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left" {...props} />,
          td: ({node, ...props}) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
