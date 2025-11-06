import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('usuario');
    localStorage.removeItem('authenticated');
    
    console.log('✅ Logout realizado - cache limpo');

    window.dispatchEvent(new Event('user-updated'));

    navigate('/', { replace: true });
  };

  return { logout };
};
