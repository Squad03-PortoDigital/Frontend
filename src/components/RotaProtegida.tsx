import { Navigate } from 'react-router-dom';
import { usePermissao } from '../contexts/PermissaoContext';
import { useEffect } from 'react';

interface RotaProtegidaProps {
  children: React.ReactNode;
  permissaesRequeridas: string[] | string;
  todasPermissoes?: boolean;
}

export const RotaProtegida = ({ 
  children, 
  permissaesRequeridas,
  todasPermissoes = false 
}: RotaProtegidaProps) => {
  const { temPermissao, temAlgumaPermissao, carregando, recarregarPermissoes } = usePermissao();

  useEffect(() => {
    recarregarPermissoes();
  }, []);

  let temAcesso = false;

  if (Array.isArray(permissaesRequeridas)) {
    temAcesso = todasPermissoes 
      ? temPermissao(permissaesRequeridas)
      : temAlgumaPermissao(permissaesRequeridas);
  } else {
    temAcesso = temPermissao(permissaesRequeridas);
  }

  if (!temAcesso) {
    console.warn('❌ Usuário sem permissão - redirecionando para /home');
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
