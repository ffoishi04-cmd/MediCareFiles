// ============================================================
// MediCare API Service Layer
// Connects frontend to Node.js backend + ML service
// Falls back to mock data when backend is unavailable
// ============================================================

const API_BASE = 'http://localhost:5000/api';

// -----------------------------------------------------------
// Token Management
// -----------------------------------------------------------
export function getToken(): string | null {
  return localStorage.getItem('medicare_token');
}

export function setToken(token: string): void {
  localStorage.setItem('medicare_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('medicare_token');
  localStorage.removeItem('medicare_user');
}

export function getStoredUser(): any {
  const user = localStorage.getItem('medicare_user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: any): void {
  localStorage.setItem('medicare_user', JSON.stringify(user));
}

// -----------------------------------------------------------
// HTTP Client with Auth Headers
// -----------------------------------------------------------
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('UNAUTHORIZED');
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    // If network error (backend not running), throw specific error
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('BACKEND_OFFLINE');
    }
    throw error;
  }
}

// -----------------------------------------------------------
// Auth API
// -----------------------------------------------------------
export const authAPI = {
  async login(email: string, password: string): Promise<any> {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.success) {
      setToken(data.data.token);
      setStoredUser(data.data.user);
    }
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    universityId?: string;
    department?: string;
    phone?: string;
    bloodGroup?: string;
  }): Promise<any> {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.success) {
      setToken(data.data.token);
      setStoredUser(data.data.user);
    }
    return data;
  },

  async getProfile(): Promise<any> {
    return apiRequest('/auth/me');
  },

  logout(): void {
    removeToken();
  }
};

// -----------------------------------------------------------
// Appointments API
// -----------------------------------------------------------
export const appointmentsAPI = {
  async getAll(params?: { status?: string; date?: string; limit?: number; [key: string]: any }): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/appointments${query}`);
  },

  async create(appointmentData: any): Promise<any> {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  async update(id: string, data: any): Promise<any> {
    return apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async cancel(id: string): Promise<any> {
    return apiRequest(`/appointments/${id}`, { method: 'DELETE' });
  }
};

// -----------------------------------------------------------
// Prescriptions API
// -----------------------------------------------------------
export const prescriptionsAPI = {
  async getAll(params?: { status?: string; limit?: number; [key: string]: any }): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/prescriptions${query}`);
  },

  async create(prescriptionData: any): Promise<any> {
    return apiRequest('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData)
    });
  },

  async dispense(id: string): Promise<any> {
    return apiRequest(`/prescriptions/${id}/dispense`, { method: 'PUT' });
  }
};

// -----------------------------------------------------------
// Medicines API
// -----------------------------------------------------------
export const medicinesAPI = {
  async getAll(params?: { search?: string; category?: string; limit?: number; [key: string]: any }): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/medicines${query}`);
  },

  async create(medicineData: any): Promise<any> {
    return apiRequest('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData)
    });
  },

  async update(id: string, data: any): Promise<any> {
    return apiRequest(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getStats(): Promise<any> {
    return apiRequest('/medicines/stats/inventory');
  }
};

// -----------------------------------------------------------
// Ambulance API
// -----------------------------------------------------------
export const ambulanceAPI = {
  async getAll(): Promise<any> {
    return apiRequest('/ambulances');
  },

  async dispatch(id: string, data: any): Promise<any> {
    return apiRequest(`/ambulances/${id}/dispatch`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async completeMission(id: string): Promise<any> {
    return apiRequest(`/ambulances/${id}/complete`, { method: 'PUT' });
  },

  async requestEmergency(data: any): Promise<any> {
    return apiRequest('/ambulances/emergency-request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// -----------------------------------------------------------
// ML Service API
// -----------------------------------------------------------
export const mlAPI = {
  async predictDisease(symptoms: string[]): Promise<any> {
    const res = await apiRequest('/ml/predict', {
      method: 'POST',
      body: JSON.stringify({ symptoms })
    });
    
    if (res.success && res.data && res.data.predictions && res.data.predictions.length > 0) {
      return res.data.predictions[0];
    }
    throw new Error('No diagnosis could be determined.');
  },

  async predictHealthRisk(symptoms: string[], history: string[]): Promise<any> {
    return apiRequest('/ml/predict-health-risk', {
      method: 'POST',
      body: JSON.stringify({ symptoms, history })
    });
  },

  async predictMedicineDemand(medicineName: string, historyUsage: [number, number][]): Promise<any> {
    return apiRequest('/ml/medicine-demand', {
      method: 'POST',
      body: JSON.stringify({ medicine_name: medicineName, history_usage: historyUsage })
    });
  },

  async healthCheck(): Promise<any> {
    return apiRequest('/ml/health');
  },

  async analyzeTrends(dataType?: string, period?: string): Promise<any> {
    return apiRequest('/ml/analyze-trends', {
      method: 'POST',
      body: JSON.stringify({ data_type: dataType, period })
    });
  }
};

// -----------------------------------------------------------
// Users API
// -----------------------------------------------------------
export const usersAPI = {
  async getAll(params?: any): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/users${query}`);
  }
};

// -----------------------------------------------------------
// Backend Health Check
// -----------------------------------------------------------
export async function checkBackendHealth(): Promise<{
  backend: boolean;
  database: boolean;
  ml: boolean;
}> {
  try {
    const data = await apiRequest('/health');
    const mlStatus = await mlAPI.healthCheck().catch(() => ({ mlService: 'OFFLINE' }));

    return {
      backend: data.status === 'OPERATIONAL',
      database: data.database === 'CONNECTED',
      ml: mlStatus.mlService === 'OPERATIONAL'
    };
  } catch {
    return { backend: false, database: false, ml: false };
  }
}
