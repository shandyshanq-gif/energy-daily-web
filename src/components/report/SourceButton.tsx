interface SourceButtonProps {
  source: string;
  url?: string;
}

export default function SourceButton({ source, url }: SourceButtonProps) {
  if (!url) {
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
