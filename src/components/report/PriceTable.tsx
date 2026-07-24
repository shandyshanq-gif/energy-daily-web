import SourceButton from "./SourceButton";

interface PriceTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
  icon?: React.ReactNode;
}

function getChangeInfo(value: string): { direction: "up" | "down" | "flat"; displayValue: string } {
  if (value.includes("↑")) return { direction: "up", displayValue: value };
  if (value.includes("↓")) return { direction: "down", displayValue: value };
  const trimmed = value.trim();
  if (trimmed === "—" || trimmed === "-" || trimmed === "" || trimmed === "0") {
    return { direction: "flat", displayValue: trimmed || "—" };
  }
  return { direction: "flat", displayValue: value };
}

/**
 * 从一个 cell 内容中提取 markdown 链接 [text](url)
 */
function extractLink(cell: string): { text: string; url: string } | null {
  const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) {
    return { text: match[1], url: match[2] };
  }
  return null;
}

export default function PriceTable({ title, headers, rows, icon }: PriceTableProps) {
  const changeColumnIndices = headers.reduce<number[]>((acc, header, idx) => {
    const lower = header.toLowerCase();
    if (lower.includes("涨跌") || lower.includes("变化") || lower.includes("较上") || lower.includes("环比") || lower.includes("同比") || lower.includes("change")) {
      acc.push(idx);
    }
    return acc;
  }, []);

  const sourceColumnIndex = headers.findIndex(h => h.toLowerCase().includes("来源"));

  return (
    <div
      className="border"
      style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
    >
      {title && (
        <div
          className="flex items-center gap-2"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--line-subtle)',
          }}
        >
          {icon}
          <h3 className="text-[13px] font-semibold">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="text-left"
                  style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-tertiary)',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--line)',
                    textAlign: idx === 0 ? 'left' : 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{
                  background: rowIdx % 2 === 1 ? 'var(--bg-soft)' : 'transparent',
                }}
                className="hover:bg-[var(--bg-soft)]"
              >
                {row.map((cell, cellIdx) => {
                  const isChangeColumn = changeColumnIndices.includes(cellIdx);
                  const isSourceColumn = cellIdx === sourceColumnIndex;
                  const changeInfo = isChangeColumn ? getChangeInfo(cell) : null;
                  const link = isSourceColumn ? extractLink(cell) : null;

                  return (
                    <td
                      key={cellIdx}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid var(--line-subtle)',
                        color: cellIdx === 0 ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                        fontWeight: cellIdx === 0 ? '500' : '400',
                        textAlign: cellIdx === 0 ? 'left' : 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {changeInfo ? (
                        <span
                          className="change-${changeInfo.direction}"
                          style={{
                            color:
                              changeInfo.direction === 'up' ? 'var(--red)' :
                              changeInfo.direction === 'down' ? 'var(--ink-secondary)' :
                              'var(--ink-tertiary)',
                            fontWeight: '500',
                          }}
                        >
                          {changeInfo.displayValue}
                        </span>
                      ) : isSourceColumn && link ? (
                        <span style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
                          <SourceButton source={link.text} url={link.url} />
                        </span>
                      ) : isSourceColumn && cell && !link ? (
                        <SourceButton source={cell} />
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
