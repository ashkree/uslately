import { useState } from "react";
import NamePicker from "./components/NamePicker";
import Feed from "./components/Feed";

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  if (!user) return <NamePicker onSelect={setUser} />;

  return <Feed currentUser={user} />;
}
