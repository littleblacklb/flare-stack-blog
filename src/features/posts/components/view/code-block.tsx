import { Check, Copy } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { highlight as highlightCode } from "@/lib/shiki";
import { useTheme } from "@/components/common/theme-provider";

// Map short codes to display labels
const LANGUAGE_MAP: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  rb: "Ruby",
  ruby: "Ruby",
  go: "Go",
  rs: "Rust",
  rust: "Rust",
  java: "Java",
  cpp: "C++",
  c: "C",
  php: "PHP",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  yaml: "YAML",
  xml: "XML",
  sql: "SQL",
  sh: "Shell",
  bash: "Bash",
  md: "Markdown",
  text: "Plain Text",
  txt: "Plain Text",
};

const highlightCache = new Map<string, string>();

interface CodeBlockProps {
  code: string;
  language: string | null;
}

export const CodeBlock = memo(({ code, language }: CodeBlockProps) => {
  const { appTheme } = useTheme();
  const cacheKey = `${appTheme}-${language}-${code}`;
  // Initialize with fallback to prevent layout shift
  const [html, setHtml] = useState<string>(
    highlightCache.get(cacheKey) ||
      `<pre class="shiki font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground bg-transparent! p-0 m-0 border-0"><code>${code}</code></pre>`,
  );

  const [copied, setCopied] = useState(false);

  // Helper to get display label
  const displayLanguage = language
    ? LANGUAGE_MAP[language.toLowerCase()] || language
    : "Plain Text";

  useEffect(() => {
    // If cached, just update state
    if (highlightCache.has(cacheKey)) {
      const cached = highlightCache.get(cacheKey)!;
      if (html !== cached) {
        setHtml(cached);
      }
      return;
    }

    let mounted = true;

    async function highlight() {
      try {
        const highlighted = await highlightCode(
          code.trim(),
          language || "text",
        );

        if (mounted) {
          highlightCache.set(cacheKey, highlighted);
          setHtml(highlighted);
        }
      } catch (e) {
        console.error("Shiki failed to load:", e);
        // Fallback is already rendered
      }
    }

    highlight();

    return () => {
      mounted = false;
    };
  }, [code, language, appTheme, cacheKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-12 group relative max-w-full">
      <div className="relative rounded-sm overflow-hidden border border-zinc-200/40 dark:border-zinc-800/40 hover:border-zinc-300/60 dark:hover:border-zinc-700/60 transition-colors duration-500">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/10 dark:border-zinc-800/10 bg-zinc-100 dark:bg-zinc-800 select-none rounded-t-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-medium text-muted-foreground/80">
              {displayLanguage}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            {copied ? (
              <span className="animate-in fade-in slide-in-from-right-1 opacity-70">
                已复制
              </span>
            ) : null}
            <div className="p-0.5 opacity-60 group-hover/btn:opacity-100 transition-opacity">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </div>
          </button>
        </div>

        {/* Code Area */}
        <div className="relative p-0 overflow-x-auto custom-scrollbar rounded-b-sm">
          <div className="text-sm font-mono leading-relaxed transition-opacity duration-300">
            <div
              className="[&>pre]:p-6 [&>pre]:m-0 [&>pre]:min-w-full [&>pre]:w-fit [&>pre]:rounded-b-sm"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
