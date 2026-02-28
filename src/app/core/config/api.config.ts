import { environment } from '../../../environments/environment';

export const API_URL = environment.apiUrl ?? '';
export const API_BASE = API_URL ? `${API_URL}/api` : '/api';
