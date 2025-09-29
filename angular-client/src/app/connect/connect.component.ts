import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  TenantService,
  Tenant,
  TenantRoleDefinition,
  ConnectSessionResponse,
  ConnectSessionStatus,
} from '../../_services/tenant.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})
export class ConnectComponent implements OnInit, OnDestroy {
  tenants$!: Observable<Tenant[]>;
  roles: TenantRoleDefinition[] = [];
  form: FormGroup;
  connecting = false;
  sessionState?: string;
  statusMessage = '';
  errorMessage = '';
  private pollHandle?: number;
  private readonly messageListener: (event: MessageEvent) => void;

  constructor(private fb: FormBuilder, private tenantService: TenantService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      plan: ['starter', Validators.required],
      artistUserId: ['']
    });

    this.messageListener = (event: MessageEvent) => {
      if (!event?.data || typeof event.data !== 'object') {
        return;
      }
      if (event.data.source === 'meta-connect') {
        if (event.data.status === 'success') {
          this.statusMessage = 'Meta login approved. Finalizing connection...';
        } else if (event.data.status === 'error') {
          this.errorMessage = 'Meta login was cancelled. You can try again.';
          this.connecting = false;
        }
      }
    };
  }

  ngOnInit(): void {
    window.addEventListener('message', this.messageListener);
    this.loadTenants();
    this.loadRoles();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageListener);
    this.clearPolling();
  }

  private loadTenants(): void {
    this.tenants$ = this.tenantService.getTenants();
  }

  private loadRoles(): void {
    this.tenantService.getRoles().subscribe({
      next: roles => {
        this.roles = roles;
        if (!this.form.get('plan')?.value && roles.length > 0) {
          this.form.patchValue({ plan: roles[0].plan });
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load tenant tiers. Refresh the page to try again.';
      }
    });
  }

  get selectedRole(): TenantRoleDefinition | undefined {
    const plan = this.form.get('plan')?.value;
    return this.roles.find(r => r.plan === plan);
  }

  startConnect(): void {
    if (this.connecting) {
      return;
    }

    this.errorMessage = '';
    this.statusMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Please provide a name and pick a subscription tier before connecting.';
      return;
    }

    const payload = {
      name: this.form.get('name')?.value?.trim(),
      plan: this.form.get('plan')?.value,
      artistUserId: this.form.get('artistUserId')?.value?.trim() || null,
      role: this.selectedRole?.role ?? null
    };

    this.connecting = true;
    this.statusMessage = 'Opening Meta login...';

    this.tenantService.startConnectSession(payload).subscribe({
      next: response => this.openOAuthWindow(response),
      error: err => {
        this.connecting = false;
        this.errorMessage = err?.error?.error ?? 'Failed to start Meta connect. Please try again.';
      }
    });
  }

  private openOAuthWindow(response: ConnectSessionResponse): void {
    this.sessionState = response.state;
    const width = 640;
    const height = 760;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
    const popup = window.open(response.authorizationUrl, 'meta-oauth', features);

    if (!popup || popup.closed) {
      this.connecting = false;
      this.errorMessage = 'Popup was blocked. Please allow popups and try again.';
      this.sessionState = undefined;
      return;
    }

    this.statusMessage = 'Complete the Meta login in the popup window. This may take a few seconds.';
    this.beginPolling();
  }

  private beginPolling(): void {
    this.clearPolling();
    if (!this.sessionState) {
      return;
    }

    this.pollHandle = window.setInterval(() => this.checkSessionStatus(), 2000);
  }

  private checkSessionStatus(): void {
    if (!this.sessionState) {
      return;
    }

    this.tenantService.getConnectSessionStatus(this.sessionState).subscribe({
      next: status => this.handleSessionStatus(status),
      error: () => {
        this.clearPolling();
        this.connecting = false;
        this.errorMessage = 'Lost connection while waiting for Meta. Please try connecting again.';
      }
    });
  }

  private handleSessionStatus(status: ConnectSessionStatus): void {
    if (status.status === 'Pending') {
      return;
    }

    this.clearPolling();
    this.connecting = false;

    if (status.status === 'Completed') {
      this.statusMessage = 'Instagram connected successfully! Refreshing tenant list...';
      this.form.reset({
        name: '',
        plan: this.roles[0]?.plan ?? 'starter',
        artistUserId: ''
      });
      this.sessionState = undefined;
      this.loadTenants();
    } else {
      this.errorMessage = status.error ?? 'Meta connect failed. Please try again.';
      this.sessionState = undefined;
    }
  }

  private clearPolling(): void {
    if (this.pollHandle) {
      window.clearInterval(this.pollHandle);
      this.pollHandle = undefined;
    }
  }
}
