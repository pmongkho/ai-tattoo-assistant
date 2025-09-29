import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Tenant {
  id: string;
  name: string;
  metaPageId?: string;
  instagramAccountId?: string;
  artistUserId?: string;
  plan: string;
  role: string;
  capabilities: string[];
  trialEndsAt?: string;
}

export interface TenantRoleDefinition {
  plan: string;
  role: string;
  displayName: string;
  description: string;
  capabilities: string[];
}

export interface ConnectSessionRequest {
  name: string;
  plan: string;
  artistUserId?: string | null;
  role?: string | null;
}

export interface ConnectSessionResponse {
  state: string;
  authorizationUrl: string;
  plan: string;
  role: string;
  capabilities: string[];
}

export interface ConnectSessionStatus {
  status: 'Pending' | 'Completed' | 'Failed';
  plan: string;
  role: string;
  capabilities: string[];
  tenantId?: string;
  metaPageId?: string;
  instagramAccountId?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl);
  }

  getRoles(): Observable<TenantRoleDefinition[]> {
    return this.http.get<TenantRoleDefinition[]>(`${this.apiUrl}/roles`);
  }

  startConnectSession(payload: ConnectSessionRequest): Observable<ConnectSessionResponse> {
    return this.http.post<ConnectSessionResponse>(`${this.apiUrl}/connect/session`, payload);
  }

  getConnectSessionStatus(state: string): Observable<ConnectSessionStatus> {
    return this.http.get<ConnectSessionStatus>(`${this.apiUrl}/connect/session/${state}`);
  }
}
