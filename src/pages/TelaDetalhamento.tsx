import { Button } from "@mui/material";
import "./TelaDetalhamento.css";
import agentegpt from "../images/agentegpt-logo.png";
import netizLogo from "../images/netiz-logo.png";
import { useState } from "react";

export default function TelaDetalhamento() {

  // Dropdowns da seção de informações no titulo
  const [statusOpen, setStatusOpen] = useState(false);
  const [tempoOpen, setTempoOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);

  const progresso = 80;

  // Lista inicial de tarefas
  const [tasks, setTasks] = useState([
    { id: 1, name: "Folder", done: false },
    { id: 2, name: "Totens", done: false },
    { id: 3, name: "Outdoors", done: false },
    { id: 4, name: "Posters", done: true },
  ]);

  // Estado para nova task
  const [novoTaskName, setNovoTaskName] = useState("");

  // Função que alterna o estado "done"
  const toggleTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  // Função para adicionar nova task
  const adicionarTask = () => {
    if (!novoTaskName.trim()) return;

    const novaTask = {
      id: tasks.length + 1,
      name: novoTaskName,
      done: false,
    };

    setTasks([novaTask, ...tasks]);
    setNovoTaskName(""); // limpa o input
  };

  // ✅ Função para remover task
  const removerTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Dados mokados para os comentários 
  const [comentarios, setComentarios] = useState([
    {
      id: 1,
      usuario: "MG",
      cor: "#d6d6ff",
      texto: "Adicionar um novo critério de aceitação ✅",
      data: "07/10 às 12:45",
    },
    {
      id: 2,
      usuario: "TP",
      cor: "#c9f7e7",
      texto: "Novo critério adicionado ✅",
      data: "08/10 às 09:20",
    },
    {
      id: 3,
      usuario: "NZ",
      cor: "#ffe8e8",
      texto: "Arte já disponível no Drive 🎨",
      data: "09/10 às 11:34",
    },
  ]);

  const [novoComentario, setNovoComentario] = useState("");

  const adicionarComentario = () => {
    if (novoComentario.trim() === "") return;
    const novo = {
      id: comentarios.length + 1,
      usuario: "AR", // mockado
      cor: "#e0f0ff",
      texto: novoComentario,
      data: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setComentarios([novo, ...comentarios]);
    setNovoComentario("");
  };

  return (
    <div className="detalhamento-container">
      <div className="detalhamento-content">
        <div className="detalhamento-header">
          <div className="detalhamento-header-empresa">
            <div className="detalhamento-header-empresa-logo"><img src={netizLogo} alt="Logo da Empresa" /></div>
            <span>Netiz</span>
          </div>
          <div className="detalhamento-header-agente">
            <div className="detalhamento-header-agente-logo"><img src={agentegpt} alt="Logo do Agente" /></div>
            <span>Ir para o ChatGPT</span>
          </div>
        </div>
        <div className="detalhamento-title">
          <div className="detalhamento-title-text">
            <h1>Criar campanha “Internet Fibra 500 Mega”</h1>
          </div>

          <div className="detalhamento-title-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
            <span className="progress-label">{progresso}%</span>
          </div>

          <div className="detalhamento-title-infos">
            {/* Usuários */}
            <div className="detalhamento-title-info-usuarios">
              <img src="https://i.pravatar.cc/24?img=1" alt="GA" />
              <img src="https://i.pravatar.cc/24?img=2" alt="CM" />
              <img src="https://i.pravatar.cc/24?img=3" alt="MG" />
            </div>

            {/* Status */}
            <div
              className="detalhamento-title-info"
              onClick={() => setStatusOpen(!statusOpen)}
            >
              <span>Status: TO DO ▼</span>
              {statusOpen && (
                <ul className="dropdown">
                  <li>TO DO</li>
                  <li>In Progress</li>
                  <li>Done</li>
                </ul>
              )}
            </div>

            {/* Tempo */}
            <div
              className="detalhamento-title-info"
              onClick={() => setTempoOpen(!tempoOpen)}
            >
              <span>Tempo: xxxxxxx ▼</span>
              {tempoOpen && (
                <ul className="dropdown">
                  <li>1 semana</li>
                  <li>2 semanas</li>
                  <li>1 mês</li>
                </ul>
              )}
            </div>

            {/* Área */}
            <div
              className="detalhamento-title-info"
              onClick={() => setAreaOpen(!areaOpen)}
            >
              <span>Área: xxxxxxx ▼</span>
              {areaOpen && (
                <ul className="dropdown">
                  <li>Marketing</li>
                  <li>Comercial</li>
                  <li>Design</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="detalhamento-body">
          <div className="detalhamento-body-item">
            <h2>Descrição</h2>
            <p>Desenvolver uma campanha digital para promover o plano Internet Fibra 500 Mega da Netiz. A campanha deve destacar velocidade, estabilidade da conexão e benefícios 
exclusivos para clientes novos. Incluir materiais para redes sociais, e-mail marketing 
e anúncios pagos (Google Ads / Facebook Ads).</p>
          </div>
          <div className="detalhamento-body-item">
            <h2>Critérios de Aceite</h2>
            <ul>
              <li>Peças visuais (arte + texto) criadas em formato para Instagram, Facebook e WhatsApp.</li>
              <li>E-mail marketing com destaque para call-to-action “Assine agora” revisado.</li>
              <li>Landing page “Assine 500 Mega” com formulário de contato pronta para publicação.</li>
              <li>Configuração inicial de campanhas no Google Ads com palavras-chave relacionadas a “internet fibra Sergipe”.</li>
              <li>Revisão final aprovada pela equipe de marketing.</li>
            </ul>
          </div>
          <div className="detalhamento-body-item">
            <h2>Links</h2>
            <ul>
              <li><a href="#">🔗 https://drive.google.com/netiz-campanha-fibra500</a></li>
            </ul>
          </div>

          {/* Task List com input para nova tarefa */}
          <div className="detalhamento-body-item">
            <h2>Task List</h2>

            {/* Input para nova task */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="Novo item"
                value={novoTaskName}
                onChange={(e) => setNovoTaskName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionarTask()}
                style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <button onClick={adicionarTask}>Adicionar</button>
            </div>

            <ul className="task-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${task.done ? "done" : ""}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={() => toggleTask(task.id)}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>{task.name}</span>
                  </div>
                  {/* Botão para remover task */}
                  <button
                    onClick={() => removerTask(task.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ff4d4f",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                    title="Remover task"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="detalhamento-footer">
          <Button variant="outlined">Cancelar</Button>
          <Button variant="contained" style={{ backgroundColor: "#264fa2"}}>Salvar alterações</Button>
        </div>
      </div>

      <div className="detalhamento-sections">
        <div className="detalhamento-historico">
          <h2 className="detalhamento-historico-title">Histórico</h2>
          <p>Tarefa criada: 17/08 às 12:45</p>
          <p>Movida para In Progress: 19/08 às 11:40</p>
          <p>Movida para Review: 22/08 às 12:33</p>
        </div>
        <div className="detalhamento-comentarios">
          <h2 className="detalhamento-comentarios-title">Comentários</h2>

          <div className="detalhamento-comentarios-list">
            {comentarios.map((c) => (
              <div key={c.id} className="detalhamento-comentarios-item">
                <div
                  className="comentario-avatar"
                  style={{ backgroundColor: c.cor }}
                >
                  {c.usuario}
                </div>
                <div className="comentario-conteudo">
                  <p className="comentario-texto">{c.texto}</p>
                  <span className="comentario-data">{c.data}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="detalhamento-comentarios-input">
            <input
              type="text"
              placeholder="Adicione um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarComentario()}
            />
            <button onClick={adicionarComentario}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
