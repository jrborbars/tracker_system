const API_BASE_URL = 'http://localhost:8000';

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao realizar login');
  }
  return data;
}

export async function register(user) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao cadastrar usuário');
  }
  return data;
}

export async function getProfile(token) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao obter perfil');
  }
  return data;
}

export async function updateProfile(token, profileData) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao atualizar perfil');
  }
  return data;
}

export async function getDevices(token) {
  const response = await fetch(`${API_BASE_URL}/devices/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao listar dispositivos');
  }
  return data;
}

export async function createDevice(token, deviceData) {
  const response = await fetch(`${API_BASE_URL}/devices/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(deviceData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao cadastrar dispositivo');
  }
  return data;
}

export async function deleteDevice(token, deviceId) {
  const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao excluir dispositivo');
  }
  return data;
}

export async function getAreas(token) {
  const response = await fetch(`${API_BASE_URL}/areas/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao listar zonas seguras');
  }
  return data;
}

export async function getMessages(token) {
  const response = await fetch(`${API_BASE_URL}/messages/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao listar mensagens');
  }
  return data;
}

export async function uploadPhoto(token, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Erro ao enviar foto');
  }
  return data;
}

