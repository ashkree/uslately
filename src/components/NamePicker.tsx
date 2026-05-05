interface NamePickerProps {
  onSelect: (name: string) => void;
}

export default function NamePicker({ onSelect }: NamePickerProps) {
  const handleSelect = (name: string) => {
    localStorage.setItem("user", name);
    onSelect(name);
  };

  return (
    <div>
      <h1>who are you?</h1>
      <button onClick={() => handleSelect("Me")}>Me</button>
      <button onClick={() => handleSelect("Her")}>Her</button>
    </div>
  );
}
