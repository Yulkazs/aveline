"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, PenLine, Users } from "lucide-react";
import PostCard, { type PostSummary } from "@/components/community/PostCard";

type Props = {
  posts: PostSummary[];
  currentUserId: string | null;
};

export default function CommunityFeed({ posts: initialPosts, currentUserId }: Props) {
  const router = useRouter();
  const [posts] = useState<PostSummary[]>(initialPosts);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-5 pt-14 pb-4 border-b"
        style={{ borderColor: "#f0f0f0" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#f5f8f5" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <div className="flex-1">
            <h1
              className="font-display text-xl font-semibold leading-tight"
              style={{ color: "#122A1A" }}
            >
              Community
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
              Deel recepten en ervaringen
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/community/nieuw")}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: "#304C3A" }}
          >
            <PenLine size={15} strokeWidth={2} />
            Nieuw
          </button>
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <EmptyState onNew={() => router.push("/dashboard/community/nieuw")} />
        ) : (
          <div className="px-5 py-4 flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#EFF5EE" }}
      >
        <Users size={28} color="#304C3A" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold mb-1" style={{ color: "#122A1A" }}>
        Nog geen berichten
      </p>
      <p className="text-sm mb-6" style={{ color: "#9aada2" }}>
        Wees de eerste die een recept of ervaring deelt!
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
        style={{ background: "#304C3A" }}
      >
        <PenLine size={15} strokeWidth={2} />
        Eerste bericht plaatsen
      </button>
    </div>
  );
}