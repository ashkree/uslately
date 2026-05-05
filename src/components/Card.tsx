import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Post, Reply } from "../types";

interface CardProps {
  post: Post;
  currentUser: string;
}

export default function Card({ post, currentUser }: CardProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReplies = useCallback(async () => {
    const { data } = await supabase
      .from("replies")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setReplies(data);
  }, [post.id]);

  useEffect(() => {
    fetchReplies();

    const channel = supabase
      .channel(`replies:${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "replies",
          filter: `post_id=eq.${post.id}`,
        },
        fetchReplies,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReplies, post.id]);

  const handleReply = async () => {
    if (!replyText) return;
    setLoading(true);

    await supabase.from("replies").insert({
      post_id: post.id,
      author: currentUser,
      text: replyText,
    });

    setReplyText("");
    setLoading(false);
  };

  return (
    <div>
      <span>{post.type}</span>
      <h2>{post.title}</h2>
      {post.sub && <p>{post.sub}</p>}
      <p>{post.note}</p>
      <span>{post.sender}</span>
      {post.type === "photo" && post.image_url && (
        <img src={post.image_url} alt={post.title} />
      )}

      <div>
        {replies.map((reply) => (
          <div key={reply.id}>
            <strong>{reply.author}</strong>
            <span>{reply.text}</span>
          </div>
        ))}
      </div>

      <input
        placeholder="reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <button onClick={handleReply} disabled={loading}>
        {loading ? "..." : "reply"}
      </button>
    </div>
  );
}
