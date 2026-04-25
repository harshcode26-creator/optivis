export function getUserFromToken() {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(atob(payload));

    return {
      userId: decodedPayload.userId,
      role: decodedPayload.role,
      workspaceId: decodedPayload.workspaceId,
    };
  } catch {
    return null;
  }
}
