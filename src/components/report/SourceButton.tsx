interface SourceButtonProps {
  source: string;
  url?: string;
}

/**
 * 判断 URL 是否安全可用
 * - 空值 / "#" / javascript: / sogou /link?url= 均视为不可用，降级为纯文本
 */
function isSafeUrl(url?: string): boolean {
  if (!url) return false;
  if (url === "#") return false;
  if (/^javascript:/i.test(url)) return false;
  if (/^\/link\?url=/i.test(url)) return false; // sogou 跳转链接
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export default function SourceButton({ source, url }: SourceButtonProps) {
  if (!isSafeUrl(url)) {
    return (
      <span
        className="source-btn"
        style={{ color: 'var(--ink-tertiary)', borderColor: 'var(--line)', cursor: 'default' }}
      >
        {source}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="source-btn"
    >
      {source} ↗
    </a>
  );
}
