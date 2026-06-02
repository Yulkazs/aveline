"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Pin, Image as ImageIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type PostSummary = {
  id: string;
  title: string | null;
  content: string;
  imageUrls: string[];
  isPinned: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count: { comments: number };
};

type Props = { post: PostSummary; currentUserId: string | null };

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMin < 1) return "Zojuist";
  if (diffMin < 60) return `${diffMin}m geleden`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}u geleden`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d geleden`;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function authorName(user: PostSummary["user"]) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Anoniem";
}

function initials(user: PostSummary["user"]) {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PostCard({ post, currentUserId }: Props) {
  const router = useRouter();
  const isOwn = currentUserId === post.user.id;

  return (
    <button
      onClick={() => router.push(`/dashboard/community/${post.id}`)}
      className="w-full text-left"
    >
      <div
        className="rounded-2xl p-4 border transition-colors active:scale-[0.99]"
        style={{
          background: post.isPinned ? "#EFF5EE" : "#ffffff",
          borderColor: post.isPinned ? "#c8d9c2" : "#f0f0f0",
        }}
      >
        {/* ── Top row: avatar + meta + pin ── */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
            style={{ background: "#304C3A", color: "#ffffff" }}
          >
            {initials(post.user)}
          </div>

          {/* Name + date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-medium" style={{ color: "#122A1A" }}>
                {authorName(post.user)}
              </span>
              {isOwn && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: "#e8f0e5", color: "#304C3A" }}
                >
                  Jij
                </span>
              )}
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "#9aada2" }}>
              {formatDate(post.createdAt)}
            </p>
          </div>

          {/* Pinned badge */}
          {post.isPinned && (
            <div className="flex items-center gap-1" style={{ color: "#304C3A" }}>
              <Pin size={12} strokeWidth={2} />
              <span className="text-[11px] font-medium">Vastgezet</span>
            </div>
          )}
        </div>

        {/* ── Title ── */}
        {post.title && (
          <p
            className="mt-3 text-sm font-semibold leading-snug"
            style={{ color: "#122A1A" }}
          >
            {post.title}
          </p>
        )}

        {/* ── Content preview ── */}
        <p
          className="mt-1.5 text-sm leading-relaxed line-clamp-3"
          style={{ color: "#5a6e62" }}
        >
          {post.content}
        </p>

        {/* ── Image thumbnail strip ── */}
        {post.imageUrls.length > 0 && (
          <div className="mt-3 flex gap-2">
            {post.imageUrls.slice(0, 3).map((url, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: "#e8ede9" }}
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {post.imageUrls.length > 3 && (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-medium"
                style={{ background: "#e8ede9", color: "#7a8f82" }}
              >
                +{post.imageUrls.length - 3}
              </div>
            )}
          </div>
        )}

        {/* ── Footer: comment count + image indicator ── */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: "#f0f0f0" }}>
          <div className="flex items-center gap-1.5" style={{ color: "#9aada2" }}>
            <MessageCircle size={13} strokeWidth={1.75} />
            <span className="text-xs">
              {post._count.comments === 0
                ? "Nog geen reacties"
                : `${post._count.comments} reactie${post._count.comments !== 1 ? "s" : ""}`}
            </span>
          </div>
          {post.imageUrls.length > 0 && (
            <div className="flex items-center gap-1" style={{ color: "#9aada2" }}>
              <ImageIcon size={12} strokeWidth={1.75} />
              <span className="text-xs">{post.imageUrls.length}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}