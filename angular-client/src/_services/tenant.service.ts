import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Tenant {
  id: string;
  name: string;
  metaPageId?: string;
  instagramAccountId?: string;
  plan: string;
  trialEndsAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl);
  }

  connectTenant(data: any) {
    return this.http.post(`${this.apiUrl}/connect`, data);
  }
}
