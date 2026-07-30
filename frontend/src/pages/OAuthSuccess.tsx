import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// The backend's Google/GitHub OAuth callbacks redirect here with tokens in
// the URL (e.g. /oauth-success?accessToken=...&refreshToken=...) rather than
// setting a cookie, since the API and frontend run on different origins in
// dev. We grab the token, store it the same way the email/password flow
// does, then bounce to the dashboard.
export function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }
    window.localStorage.setItem('buildmonitor-access-token', accessToken);
    refreshUser()
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login', { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Signing you in…</p>
    </div>
  );
}
