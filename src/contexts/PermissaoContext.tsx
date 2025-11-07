import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface PermissaoContextType {
  permissoes: string[];
  carregando: boolean;
  temPermissao: (permissao: string | string[]) => boolean;
  temAlgumaPermissao: (permissoes: string[]) => boolean;
  recarregarPermissoes: () => Promise<void>;
}

const PermissaoContext = createContext<PermissaoContextType | undefined>(undefined);

export const PermissaoProvider = ({ children }: { children: React.ReactNode }) => {
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPermissoes();

    window.addEventListener('user-updated', carregarPermissoes);

    return () => {
      window.removeEventListener('user-updated', carregarPermissoes);
    };
  }, []);

  const carregarPermissoes = async () => {
    try {
      const auth = localStorage.getItem('auth');
      const usuario = localStorage.getItem('usuario');

      console.log('🔍 Carregando permissões...');
      console.log('🔍 Auth:', auth ? 'EXISTE' : 'NÃO EXISTE');
      console.log('🔍 Usuario:', usuario ? 'EXISTE' : 'NÃO EXISTE');

      if (!auth || !usuario) {
        console.log('❌ Sem autenticação - limpando cache');
        setPermissoes([]);
        setCarregando(false);
        return;
      }

      const usuarioData = JSON.parse(usuario);
      console.log('🔍 Carregando permissões para usuário ID:', usuarioData.id);
      console.log('🔍 Email do usuário:', usuarioData.email);

      const response = await api.get(`/permissoes/usuarios/${usuarioData.id}`, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });

      console.log('✅ Resposta do backend:', response.data);

      const nomePermissoes = response.data.map((p: any) => p.nome);
      console.log('✅ Permissões extraídas:', nomePermissoes);

      setPermissoes(nomePermissoes);

    } catch (error: any) {
      console.error('❌ Erro ao carregar permissões:', error.response?.data || error.message);
      setPermissoes([]);
    } finally {
      setCarregando(false);
    }
  };

  const recarregarPermissoes = async () => {
    console.log('🔄 Recarregando permissões manualmente...');
    setCarregando(true);
    await carregarPermissoes();
  };

  const temPermissao = (permissao: string | string[]): boolean => {
    if (Array.isArray(permissao)) {
      const result = permissao.every(p => permissoes.includes(p));
      console.log(`🔍 Verificando permissões [${permissao}]: ${result ? '✅ TEM' : '❌ NÃO TEM'}`);
      console.log(`📋 Permissões atuais do usuário:`, permissoes);
      return result;
    }
    const result = permissoes.includes(permissao);
    console.log(`🔍 Verificando permissão "${permissao}": ${result ? '✅ TEM' : '❌ NÃO TEM'}`);
    console.log(`📋 Permissões atuais do usuário:`, permissoes);
    return result;
  };

  const temAlgumaPermissao = (perms: string[]): boolean => {
    const result = perms.some(p => permissoes.includes(p));
    console.log(`🔍 Verificando algumas [${perms}]: ${result ? '✅ TEM' : '❌ NÃO TEM'}`);
    return result;
  };

  return (
    <PermissaoContext.Provider value={{ permissoes, carregando, temPermissao, temAlgumaPermissao, recarregarPermissoes }}>
      {children}
    </PermissaoContext.Provider>
  );
};

export const usePermissao = () => {
  const context = useContext(PermissaoContext);
  if (!context) {
    throw new Error('usePermissao deve ser usado dentro de PermissaoProvider');
  }
  return context;
};
