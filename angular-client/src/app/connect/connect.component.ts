import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TenantService } from '../../_services/tenant.service';
import { Observable } from 'rxjs';
import { Tenant } from '../../_services/tenant.service';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.css']
})
export class ConnectComponent {
  tenants$!: Observable<Tenant[]>;
  form: FormGroup;

  constructor(private fb: FormBuilder, private tenantService: TenantService) {
    this.form = this.fb.group({
      name: [''],
      metaPageId: [''],
      pageAccessToken: [''],
      instagramAccountId: [''],
      instagramToken: [''],
      plan: ['trial']
    });
    this.loadTenants();
  }

  loadTenants() {
    this.tenants$ = this.tenantService.getTenants();
  }

  submit() {
    if (this.form.valid) {
      this.tenantService.connectTenant(this.form.value).subscribe(() => {
        this.form.reset();
        this.loadTenants();
      });
    }
  }
}
