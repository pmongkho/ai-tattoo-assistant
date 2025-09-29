import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ConnectComponent } from './connect.component';
import { TenantService } from '../../_services/tenant.service';

describe('ConnectComponent', () => {
  let component: ConnectComponent;
  let fixture: ComponentFixture<ConnectComponent>;

  beforeEach(async () => {
    const tenantServiceStub = {
      getTenants: jasmine.createSpy('getTenants').and.returnValue(of([])),
      getRoles: jasmine.createSpy('getRoles').and.returnValue(of([])),
      startConnectSession: jasmine.createSpy('startConnectSession').and.returnValue(of({
        state: 'state',
        authorizationUrl: 'https://example.com',
        plan: 'trial',
        role: 'trial',
        capabilities: []
      })),
      getConnectSessionStatus: jasmine.createSpy('getConnectSessionStatus').and.returnValue(of({
        status: 'Pending',
        plan: 'trial',
        role: 'trial',
        capabilities: []
      }))
    } as Partial<TenantService>;

    await TestBed.configureTestingModule({
      imports: [ConnectComponent],
      providers: [{ provide: TenantService, useValue: tenantServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
