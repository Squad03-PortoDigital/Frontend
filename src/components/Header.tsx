import "../styles/header.css";
import LogoBrancaFlap from "../images/LogoBrancaFlap.png";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, Search, Moon, Sun } from "lucide-react";
import { InputAdornment, TextField } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useLogout } from "../hooks/useLogout";
import { useTheme } from "../contexts/ThemeContext";
import api from "../services/api";

export default function Header() {
  const { logout } = useLogout();
  const { darkMode, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  // Estado para pesquisa de tarefas
  const [searchText, setSearchText] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Corrigido: useRef inicializado com null
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
    }, 500);
  };

  // Faz busca conforme digita (debounce)
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchText.length >= 2) {
      searchTimeout.current = setTimeout(async () => {
        try {
          // Ajuste a rota conforme seu backend (exemplo: /tasks/search?query=)
          const res = await api.get("/tarefas/search", { params: { query: searchText } });
          setSearchResults(res.data); // Espera retorno [{id, name}, ...]
          setShowDropdown(true);
        } catch (e) {
          setSearchResults([]);
        }
      }, 350); // debounce 350ms
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
    // Limpeza timeout no unmount
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchText]);

  // Navegar ao clicar na sugestão
  const handleResultClick = (tarefa: any) => {
    setShowDropdown(false);
    setSearchText("");
    navigate(`/detalhamento/${tarefa.id}`);
  };


  return (
    <>
      {loggingOut && <div className="logout-overlay">Saindo...</div>}
      <div className={`header-container ${loggingOut ? "fade-out" : ""}`}>
        <div className="header">
          <div className="logo-header-flap">
            <img src={LogoBrancaFlap} alt="Logo" />
          </div>
          <div className="pesquisa-header" style={{ position: "relative" }}>
            <TextField
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Pesquisar tarefas"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Menu size={18} strokeWidth={3} opacity={0.7} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Search size={18} strokeWidth={3} opacity={0.7} />
                  </InputAdornment>
                ),
                style: {
                  backgroundColor: darkMode ? "#374151" : "#cbd5f7",
                  borderRadius: "8px",
                  width: "500px",
                  height: "40px",
                  color: darkMode ? "#fff" : "#000",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& input": { color: darkMode ? "#fff" : "#000" },
                  "& input::placeholder": {
                    color: darkMode ? "#9ca3af" : "#6b7280",
                    opacity: 1,
                  },
                },
              }}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              autoComplete="off"
            />
            {showDropdown && (
              <div className="search-dropdown">
                {searchResults.length > 0 ? (
                  searchResults.map((tarefa: any) => (
                    <div
                      key={tarefa.id}
                      className="search-item"
                      onMouseDown={() => handleResultClick(tarefa)}
                    >
                      <span className="search-title">{tarefa.titulo}</span>
                      {tarefa.empresa && (
                        <span className="search-empresa">{tarefa.empresa}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="search-item">Nenhuma tarefa encontrada</div>
                )}
              </div>
            )}

          </div>
          <div className="header-actions">
            <div className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? (
                <Sun size={28} color="#fff" className="theme-icon" />
              ) : (
                <Moon size={28} color="#fff" className="theme-icon" />
              )}
            </div>
            <div className="logout-header" onClick={handleLogout}>
              <LogOut
                size={32}
                color="#fff"
                className={loggingOut ? "logout-anim" : ""}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
