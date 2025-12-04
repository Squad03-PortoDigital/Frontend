## 🎨 FLAP Kanban System - Frontend (React / TypeScript)

Este repositório contém a interface de usuário (UI) para o sistema FLAP Kanban. É uma Single Page Application (SPA) construída para consumir a API REST do nosso Backend (Java/Spring Boot).

### **1. Visão Geral e Diferenciais**

O frontend é projetado para ser altamente interativo e utiliza padrões de UX profissionais.

  * **Quadro Kanban Interativo (Drag & Drop):** Implementado com `@hello-pangea/dnd`.
  * **Controle de Acesso:** Gerencia o Cookie de Sessão (`JSESSIONID`) e as permissões de usuário para proteger as rotas.

### **2. Tecnologias**

  * **Framework:** React 18+
  * **Linguagem:** TypeScript (TSX)
  * **Estado e Contexto:** React Hooks (`useState`, `useEffect`, `useContext`)
  * **Comunicação API:** Axios
  * **Estilização:** CSS
  * **Integrações Chave:** Dropbox e Google Calendar (via Backend API).

-----

## **3. Configuração de Ambiente**

Você precisa ter o Node.js e o npm/Yarn instalados.

#### **Passo A: Instalação de Dependências**

Navegue até a pasta raiz do frontend no terminal e instale todos os pacotes:

```bash
npm install
# ou
# yarn install
```

#### **Passo B: Configuração da API URL**

Você deve informar ao frontend onde o backend está rodando. O padrão é usar o `VITE_API_URL` (assumindo que o projeto usa Vite ou similar).

Crie um arquivo **`.env`** na raiz do projeto (ou ajuste o `baseURL` do Axios) para apontar para o seu Backend.

```
# Exemplo para ambiente local:
VITE_API_URL=http://localhost:8080 

# Exemplo para ambiente de Produção (AWS/Render):
VITE_API_URL=https://seu-backend-flap.com
```

#### **Passo C: Iniciar a Aplicação**

Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
# npm start
```

A aplicação estará acessível em `http://localhost:3000` (ou a porta indicada no terminal).
