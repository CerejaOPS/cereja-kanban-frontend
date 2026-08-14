import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/shared/lib/store';
import { Loader2 } from 'lucide-react';
import { api } from '@/shared/api/client';

export function AuthCallback() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const authError = searchParams.get('auth_error');

    if (authError) {
      console.error('Authentication error from Discord');
      navigate({ to: '/' });
      return;
    }

    if (token) {
      setToken(token);
      // fetch user data using the new token
      api
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          navigate({ to: '/board' });
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          navigate({ to: '/' });
        });
    } else {
      navigate({ to: '/' });
    }
  }, [navigate, setToken, setUser]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-400">Autenticando...</p>
      </div>
    </div>
  );
}
