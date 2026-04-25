import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function JoinWorkspace() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [workspaceSlugFromUrl, setWorkspaceSlugFromUrl] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workspace = params.get('workspace');

    if (workspace) {
      setWorkspaceSlug(workspace);
      setWorkspaceSlugFromUrl(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const response = await api.post('/auth/join', {
      name,
      email,
      password,
      workspaceSlug,
      joinCode,
    });

    localStorage.setItem('token', response.data.token);
    navigate('/dashboard');
  };

  return (
    <div>
      <h1>Join Workspace</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm Password"
          required
        />
        <input
          type="text"
          value={workspaceSlug}
          onChange={(event) => setWorkspaceSlug(event.target.value)}
          placeholder="Workspace Slug"
          readOnly={workspaceSlugFromUrl}
          required
        />
        <input
          type="text"
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value)}
          placeholder="Join Code"
          required
        />
        {error && <p>{error}</p>}
        <button type="submit">Join Workspace</button>
      </form>
    </div>
  );
}

export default JoinWorkspace;
