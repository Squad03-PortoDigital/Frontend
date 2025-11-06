import "../styles/header.css";
import LogoBrancaFlap from "../images/LogoBrancaFlap.png";
import { LogOut, Menu, Search } from "lucide-react";
import { InputAdornment, TextField } from "@mui/material";
import { useState } from "react";
import { useLogout } from "../hooks/useLogout";


export default function Header() {
  const { logout } = useLogout();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
    }, 500);
  };

  return (
    <>
      {loggingOut && <div className="logout-overlay">Saindo...</div>}

      <div className={`header-container ${loggingOut ? "fade-out" : ""}`}>
        <div className="header">
          <div className="logo-header-flap">
            <img src={LogoBrancaFlap} alt="Logo" />
          </div>

          <div className="pesquisa-header">
            <TextField
              placeholder="Pesquisar"
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
                  backgroundColor: "#cbd5f7",
                  borderRadius: "8px",
                  width: "500px",
                  height: "40px",
                },
              }}
            />
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
    </>
  );
}
