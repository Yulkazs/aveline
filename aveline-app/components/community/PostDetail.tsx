"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Pin,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import CommentList, { type Comment } from "@/components/community/CommentList";

// ── Types ─────────────────────────────────────────────────────────────────────
export type PostFull = {
  id: string;
  title: string | null;
  content: string;
  imageUrls: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; firstName: string | null; lastName: string | null };
  comments: Comment[];
};

type Props = { post: PostFull; currentUserId: string | null };

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function authorName(user: PostFull["user"]) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Anoniem";
}

function initials(user: PostFull["user"]) {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PostDetail({ post, currentUserId }: Props) {
  const router = useRouter();
  const isOwn = currentUserId === post.user.id;

  // ── Menu state ──
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Edit state ──
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title ?? "");
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Delete state ──
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Active image for lightbox ──
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // ── Edit handlers ─────────────────────────────────────────────────────────
  async function saveEdit() {
    if (editContent.trim().length === 0) {
      setEditError("Inhoud mag niet leeg zijn.");
      return;
    }
    setEditError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/community/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim() || null,
          content: editContent.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Opslaan mislukt.");
      }

      setEditing(false);
      router.refresh(); // re-fetch server data
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete handlers ───────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/community/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.replace("/dashboard/community");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4 border-b"
        style={{ borderColor: "#f0f0f0" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "#f5f8f5" }}
          aria-label="Terug"
        >
          <ChevronLeft size={20} color="#304C3A" />
        </button>

        <span className="text-sm font-medium" style={{ color: "#122A1A" }}>
          Bericht
        </span>

        {/* Options menu — only for own post */}
        {isOwn && !editing && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "#f5f8f5" }}
              aria-label="Opties"
            >
              <MoreHorizontal size={20} color="#304C3A" />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-11 z-20 rounded-2xl shadow-lg overflow-hidden w-40 border"
                  style={{ background: "#ffffff", borderColor: "#f0f0f0" }}
                >
                  <button
                    onClick={() => { setMenuOpen(false); setEditing(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm"
                    style={{ color: "#304C3A" }}
                  >
                    <Pencil size={15} strokeWidth={1.75} />
                    Bewerken
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm border-t"
                    style={{ color: "#DC2626", borderColor: "#f0f0f0" }}
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                    Verwijderen
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Spacer when no menu */}
        {(!isOwn || editing) && <div className="w-9" />}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* ── Author row ── */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ background: "#304C3A", color: "#ffffff" }}
          >
            {initials(post.user)}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#122A1A" }}>
              {authorName(post.user)}
            </p>
            <p className="text-xs" style={{ color: "#9aada2" }}>
              {formatDate(post.createdAt)}
              {post.updatedAt !== post.createdAt && " · bewerkt"}
            </p>
          </div>
          {post.isPinned && (
            <div
              className="ml-auto flex items-center gap-1 text-xs font-medium"
              style={{ color: "#304C3A" }}
            >
              <Pin size={12} strokeWidth={2} />
              Vastgezet
            </div>
          )}
        </div>

        {/* ── Edit mode ── */}
        {editing ? (
          <div className="flex flex-col gap-4 mb-6">
            {editError && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-xs"
                style={{ background: "#FEF2F2", color: "#DC2626" }}
              >
                <AlertCircle size={13} strokeWidth={1.75} />
                {editError}
              </div>
            )}
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Titel (optioneel)"
              maxLength={120}
              className="w-full text-sm px-4 py-3 rounded-2xl border outline-none"
              style={{ borderColor: "#304C3A", background: "#f5f8f5", color: "#122A1A" }}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              maxLength={1000}
              className="w-full text-sm px-4 py-3 rounded-2xl border outline-none resize-none"
              style={{ borderColor: "#304C3A", background: "#f5f8f5", color: "#122A1A", lineHeight: "1.6" }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setEditing(false); setEditError(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium border"
                style={{ borderColor: "#e8ede9", color: "#7a8f82" }}
                disabled={saving}
              >
                <X size={15} />
                Annuleren
              </button>
              <button
                onClick={saveEdit}
                disabled={saving || editContent.trim().length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white"
                style={{ background: "#304C3A", opacity: saving || editContent.trim().length === 0 ? 0.5 : 1 }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Opslaan
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Title ── */}
            {post.title && (
              <h1
                className="font-display text-xl font-semibold leading-snug mb-3"
                style={{ color: "#122A1A" }}
              >
                {post.title}
              </h1>
            )}

            {/* ── Content ── */}
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap mb-5"
              style={{ color: "#304C3A" }}
            >
              {post.content}
            </p>

            {/* ── Images ── */}
            {post.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(url)}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      width: post.imageUrls.length === 1 ? "100%" : "calc(50% - 4px)",
                    }}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full object-cover"
                      style={{ maxHeight: post.imageUrls.length === 1 ? 300 : 160 }}
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Divider ── */}
        {!editing && (
          <div className="border-t mb-6" style={{ borderColor: "#f0f0f0" }} />
        )}

        {/* ── Comments ── */}
        {!editing && (
          <CommentList
            postId={post.id}
            initialComments={post.comments}
            currentUserId={currentUserId}
          />
        )}
      </div>

      {/* ── Delete confirmation sheet ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-30 flex items-end">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(18,42,26,0.4)" }}
            onClick={() => setConfirmDelete(false)}
          />
          <div
            className="relative w-full rounded-t-3xl p-6 z-40"
            style={{ background: "#ffffff" }}
          >
            <h2 className="text-base font-semibold mb-1" style={{ color: "#122A1A" }}>
              Bericht verwijderen?
            </h2>
            <p className="text-sm mb-6" style={{ color: "#7a8f82" }}>
              Dit kan niet ongedaan worden gemaakt. Alle reacties worden ook verwijderd.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium border"
                style={{ borderColor: "#e8ede9", color: "#7a8f82" }}
                disabled={deleting}
              >
                Annuleren
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl text-sm font-medium text-white"
                style={{ background: "#DC2626" }}
              >
                {deleting ? (
                  <Loader2 size={15} className="animate-spin mx-auto" />
                ) : (
                  "Verwijderen"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image lightbox ── */}
      {activeImage && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setActiveImage(null)}
        >
          <button
            className="absolute top-14 right-5 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
            aria-label="Sluiten"
          >
            <X size={18} color="white" />
          </button>
          <img
            src={activeImage}
            alt=""
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}