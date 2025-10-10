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

  // Função que alterna o estado "done"
  const toggleTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
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
          <div className="detalhamento-body-item">
            <h2>Task List</h2>
            <ul className="task-list">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${task.done ? "done" : ""}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span>{task.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="detalhamento-footer">
          <Button variant="outlined">Cancelar</Button>
          <Button variant="contained">Salvar alterações</Button>
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
              <div className="detalhamento-comentarios-item"></div>
              <div className="detalhamento-comentarios-item"></div>
              <div className="detalhamento-comentarios-item"></div>
              <div className="detalhamento-comentarios-item"></div>
            </div>
          </div>
      </div>
    </div>
  );
}