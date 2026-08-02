import Link from "next/link";
import { ArrowLeft, Archive, FileQuestion } from "lucide-react";

/**
 * 自定义 404 页面（静态导出友好）
 *
 * 当 notFound() 被调用时（如日报详情页日期不存在），
 * Next.js 会渲染此组件作为 404 页面。
 *
 * 设计目标：
 * - 清晰告知用户页面不存在
 * - 提供回到首页和历史日报列表的导航入口
 * - 保持与站点整体风格一致
 */
export default function NotFound() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Masthead */}
      <div className="masthead">
        <div>
          <div className="masthead-issue">404 · Not Found</div>
          <h1>页面未找到</h1>
          <div className="masthead-meta">
            您访问的页面可能已被移除或从未存在
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="content">
        <div className="c-12">
          <div className="card">
            <div
              className="card-body"
              style={{
                textAlign: "center",
                padding: "64px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <FileQuestion
                style={{
                  width: "48px",
                  height: "48px",
                  color: "var(--ink-tertiary)",
                }}
              />

              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--ink-primary)",
                  }}
                >
                  抱歉，该页面不存在
                </h3>
                <p
                  className="text-[12px] mt-2"
                  style={{ color: "var(--ink-secondary)", lineHeight: 1.6 }}
                >
                  如果您是通过链接访问的，请检查日期格式是否正确。
                  <br />
                  您也可以返回首页或浏览历史日报归档。
                </p>
              </div>

              {/* 导航按钮 */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Link
                  href="/"
                  className="masthead-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    textDecoration: "none",
                  }}
                >
                  <ArrowLeft
                    style={{ width: "14px", height: "14px" }}
                  />
                  返回首页
                </Link>

                <Link
                  href="/reports"
                  className="masthead-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    textDecoration: "none",
                  }}
                >
                  <Archive
                    style={{ width: "14px", height: "14px" }}
                  />
                  历史日报列表
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
