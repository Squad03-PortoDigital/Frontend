// Função para disparar o evento quando o usuário é atualizado
export const dispatchUserUpdate = () => {
  window.dispatchEvent(new Event('user-updated'));
};
