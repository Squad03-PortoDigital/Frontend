import { useState, useRef, useEffect } from "react";
import "../styles/MentionTextarea.css";

interface Usuario {
  id: number;
  nome: string;
  foto?: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  usuarios: Usuario[];
  placeholder?: string;
  onSubmit: () => void;
}

export default function MentionTextarea({
  value,
  onChange,
  usuarios,
  placeholder = "Escreva um comentário...",
  onSubmit,
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Usuario[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ AUTO-RESIZE DO TEXTAREA
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      if (textAfterAt.includes(" ")) {
        setShowSuggestions(false);
        return;
      }

      const query = textAfterAt.toLowerCase();
      const filtered = usuarios.filter((u) =>
        u.nome.toLowerCase().includes(query)
      );

      if (filtered.length > 0) {
        setSuggestions(filtered);
        setShowSuggestions(true);
        setMentionStart(lastAtIndex);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectUser = (usuario: Usuario) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);

    const textBeforeMention = textBeforeCursor.substring(0, mentionStart);
    const mention = `@${usuario.nome.toLowerCase().replace(/\s+/g, ".")} `;

    const newValue = textBeforeMention + mention + textAfterCursor;
    onChange(newValue);
    setShowSuggestions(false);

    setTimeout(() => {
      const newCursorPos = textBeforeMention.length + mention.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? suggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectUser(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const getInitials = (nome: string) => {
    const words = nome.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <div className="mention-textarea-wrapper">
      {showSuggestions && (
        <div className="mention-suggestions">
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              className={`mention-suggestion-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => selectUser(user)}
            >
              <div className="mention-avatar">
                {user.foto ? (
                  <img src={user.foto} alt={user.nome} />
                ) : (
                  <div className="mention-avatar-placeholder">
                    {getInitials(user.nome)}
                  </div>
                )}
              </div>
              <div className="mention-user-info">
                <span className="mention-user-name">{user.nome}</span>
                <span className="mention-user-tag">
                  @{user.nome.toLowerCase().replace(/\s+/g, ".")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mention-input-container">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="mention-textarea"
        />
        <button onClick={onSubmit} className="mention-send-button">
          Enviar
        </button>
      </div>
    </div>
  );
}
