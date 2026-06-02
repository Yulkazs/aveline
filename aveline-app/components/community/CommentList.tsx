"use client";

import { useState } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
};

type Props = {
  postId: string;
  initialComments: Comment[];
  currentUserId: string | null;
};

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

function authorName(user: Comment["user"]) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Anoniem";
}

function initials(user: Comment["user"]) {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CommentList({ postId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!value.trim() || submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Er ging iets mis.");
      }

      const comment: Comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* ── Section header ── */}
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: "#9aada2" }}
      >
        Reacties ({comments.length})
      </h2>

      {/* ── Comment list ── */}
      {comments.length === 0 ? (
        <p className="text-sm mb-5" style={{ color: "#9aada2" }}>
          Nog geen reacties. Wees de eerste!
        </p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {comments.map((comment) => {
            const isOwn = currentUserId === comment.user.id;
            return (
              <div key={comment.id} className="flex gap-3">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold"
                  style={{ background: isOwn ? "#304C3A" : "#e8ede9", color: isOwn ? "#fff" : "#304C3A" }}
                >
                  {initials(comment.user)}
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div
                    className="rounded-2xl rounded-tl-md px-4 py-3"
                    style={{ background: isOwn ? "#EFF5EE" : "#f5f8f5" }}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: "#122A1A" }}>
                        {authorName(comment.user)}
                      </span>
                      {isOwn && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: "#c8d9c2", color: "#304C3A" }}
                        >
                          Jij
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#304C3A" }}>
                      {comment.content}
                    </p>
                  </div>
                  <p className="text-[11px] mt-1 ml-1" style={{ color: "#9aada2" }}>
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add comment ── */}
      {currentUserId ? (
        <div>
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs mb-3"
              style={{ background: "#FEF2F2", color: "#DC2626" }}
            >
              <AlertCircle size={13} strokeWidth={1.75} />
              {error}
            </div>
          )}
          <div
            className="flex items-end gap-3 p-3 rounded-2xl border"
            style={{ borderColor: "#e8ede9", background: "#f5f8f5" }}
          >
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Schrijf een reactie…"
              rows={2}
              maxLength={500}
              className="flex-1 text-sm bg-transparent outline-none resize-none"
              style={{ color: "#122A1A", lineHeight: "1.55" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || submitting}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{
                background: "#304C3A",
                opacity: value.trim() && !submitting ? 1 : 0.35,
              }}
              aria-label="Verstuur reactie"
            >
              {submitting ? (
                <Loader2 size={15} color="white" className="animate-spin" />
              ) : (
                <Send size={15} color="white" strokeWidth={2} />
              )}
            </button>
          </div>
          <p className="text-[11px] mt-1.5 text-right" style={{ color: "#9aada2" }}>
            Enter om te versturen · Shift+Enter voor nieuwe regel
          </p>
        </div>
      ) : (
        <p className="text-sm" style={{ color: "#9aada2" }}>
          Log in om een reactie te plaatsen.
        </p>
      )}
    </div>
  );
}