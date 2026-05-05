import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { PostType } from "../types";

interface ShareModalProps {
  currentUser: string;
  onClose: () => void;
}

export default function ShareModal({ currentUser, onClose }: ShareModalProps) {
  const [type, setType] = useState<PostType>("music");
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !note) return;
    setLoading(true);

    await supabase.from("posts").insert({
      type,
      title,
      sub,
      note,
      sender: currentUser,
      image_url: type === "photo" ? imageUrl : null,
    });

    setLoading(false);
    onClose();
  };

  return (
    <div>
      <button onClick={() => setType("music")}>Music</button>
      <button onClick={() => setType("photo")}>Photo</button>

      <input
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="artist / source"
        value={sub}
        onChange={(e) => setSub(e.target.value)}
      />
      <textarea
        placeholder="your note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {type === "photo" && (
        <input
          placeholder="image url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      )}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "sharing..." : "share"}
      </button>
      <button onClick={onClose}>cancel</button>
    </div>
  );
}
