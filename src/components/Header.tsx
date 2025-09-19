import "../styles/header.css";
import LogoBrancaFlap from "../images/LogoBrancaFlap.png";
import { LogOut, Menu, Search } from "lucide-react";
import { InputAdornment, TextField } from "@mui/material";

export default function Header() {
    return (
        <div className="header-container">
            <div className="header">
                <div className="logo-header-flap"><img src={LogoBrancaFlap} alt="Logo" /></div>
                <div className="pesquisa-header">
                    <TextField
                        fullWidth
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
                            backgroundColor: "#cbd5f7", // cor de fundo do input
                            borderRadius: "8px",
                            width: "500px",
                            height: "40px",
                        },
                        }}
                    />
                </div>
                <div className="logout-header"> <LogOut size={32} color="#fff"/> </div>
            </div>
        </div>
    );
};

