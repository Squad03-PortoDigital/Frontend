import { Button } from "@mui/material";
import "./TelaDetalhamento.css";

export default function TelaDetalhamento() {
  return (
    <div className="detalhamento-container">
      <div className="detalhamento-content">
        <div className="detalhamento-header">
          <div className="detalhamento-header-empresa"></div>
          <div className="detalhamento-header-agente"></div>
        </div>
        <div className="detalhamento-title">
          <div className="detalhamento-title-text">
            <h1>Criar campanha “Internet Fibra 500 Mega”</h1>
          </div>
          <div className="detalhamento-title-progress"></div>
          <div className="detalhamento-title-infos">
            <div className="detalhamento-title-info-usuarios"></div>
            <div className="detalhamento-title-info-status"></div>
            <div className="detalhamento-title-info-tempo"></div>
            <div className="detalhamento-title-info-area"></div>
          </div>
        </div>
        <div className="detalhamento-body">
          <div className="detalhamento-body-descricao">
            <h2>Descrição</h2>
            <p>Desenvolver uma campanha digital para promover o plano Internet Fibra 500 Mega da Netiz. A campanha deve destacar velocidade, estabilidade da conexão e benefícios 
exclusivos para clientes novos. Incluir materiais para redes sociais, e-mail marketing 
e anúncios pagos (Google Ads / Facebook Ads).</p>
          </div>
          <div className="detalhamento-body-aceites">
            <h2>Critérios de Aceite</h2>
            <ul>
              <li>Peças visuais (arte + texto) criadas em formato para Instagram, Facebook e WhatsApp.</li>
              <li>E-mail marketing com destaque para call-to-action “Assine agora” revisado.</li>
              <li>Landing page “Assine 500 Mega” com formulário de contato pronta para publicação.</li>
              <li>Configuração inicial de campanhas no Google Ads com palavras-chave relacionadas a “internet fibra Sergipe”.</li>
              <li>Revisão final aprovada pela equipe de marketing.</li>
            </ul>
          </div>
          <div className="detalhamento-body-links">
            <h2>Links</h2>
            <ul>
              <li><a href="#">🔗 https://drive.google.com/netiz-campanha-fibra500</a></li>
            </ul>
          </div>
          <div className="detalhamento-body-tasks">
            <h2>Task List</h2>
            <ul>
              <li>[ ] Folder</li>
              <li>[ ] Totens</li>
              <li>[ ] Outdoors</li>
              <li>[X] Posters</li>
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
            </div>
          </div>
      </div>
    </div>
  );
}