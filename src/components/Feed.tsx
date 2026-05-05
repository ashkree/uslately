import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Post } from "../types";
import Card from "./Card";
import ShareModal from "./ShareModal";

interface FeedProps {
  currentUser: string;
}

export default function Feed({ currentUser }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    console.log("posts:", data);
    console.log("error:", error);
    if (data) setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        fetchPosts,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  if (loading) return <div>loading...</div>;

  return (
    <div>
      <button onClick={() => setShowModal(true)}>+ share</button>

      {showModal && (
        <ShareModal
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
        />
      )}

      {posts.map((post) => (
        <Card key={post.id} post={post} currentUser={currentUser} />
      ))}
    </div>
  );
}
