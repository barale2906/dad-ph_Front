import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
import type {
  User,
  UserCreatePayload,
  UserUpdatePayload,
  UserInmueble,
  UserInmuebleCreatePayload,
} from '../../../core/models/user.model';

export type UserListParams = {
  page?: number;
  per_page?: number;
  role?: string;
  tipo?: string;
  search?: string;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getAll(params?: UserListParams) {
    return this.api.getPaginated<User>('/users', params as Record<string, string | number | boolean>);
  }

  getById(id: number) {
    return this.api.get<User>(`/users/${id}`);
  }

  create(payload: UserCreatePayload) {
    return this.api.post<User>('/users', payload);
  }

  update(id: number, payload: UserUpdatePayload) {
    return this.api.put<User>(`/users/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/users/${id}`);
  }

  getInmuebles(userId: number) {
    return this.api.get<UserInmueble[]>(`/users/${userId}/inmuebles`);
  }

  addInmueble(userId: number, payload: UserInmuebleCreatePayload) {
    return this.api.post<UserInmueble>(`/users/${userId}/inmuebles`, payload);
  }

  removeInmueble(userId: number, inmuebleId: number) {
    return this.api.delete<{ message?: string }>(`/users/${userId}/inmuebles/${inmuebleId}`);
  }
}
