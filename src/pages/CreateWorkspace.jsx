import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateWorkspace() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const response = await api.post('/auth/create-workspace', {
      name,
      email,
      password,
      workspaceName,
    });

    localStorage.setItem('token', response.data.token);
    const workspaceSlug = response.data.workspaceSlug;
    const inviteLink = `${window.location.origin}/join?workspace=${workspaceSlug}`;

    setWorkspaceInfo({
      workspaceSlug,
      joinCode: response.data.joinCode,
      inviteLink,
    });
  };

  return (
    <div>
      <h1>Create Workspace</h1>

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
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
          placeholder="Workspace Name"
          required
        />
        {error && <p>{error}</p>}
        <button type="submit">Create Workspace</button>
      </form>

      {workspaceInfo && (
        <div>
          <p>Share this link with your team to join your workspace</p>
          <div
            style={{
              border: '1px solid #cccccc',
              marginBottom: '12px',
              padding: '12px',
            }}
          >
            <strong>Invite Link</strong>
            <p>{workspaceInfo.inviteLink}</p>
          </div>
          <div
            style={{
              border: '1px solid #cccccc',
              marginBottom: '12px',
              padding: '12px',
            }}
          >
            <strong>Join Code</strong>
            <p>{workspaceInfo.joinCode}</p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(workspaceInfo.inviteLink)}
          >
            Copy Link
          </button>
          <button type="button" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateWorkspace;
