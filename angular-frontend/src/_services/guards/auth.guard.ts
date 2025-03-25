// src/app/guards/auth.guard.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { AuthService } from '../../_services/auth.service'
import { isPlatformBrowser } from '@angular/common'

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object
	) {}

	canActivate(): boolean {
		if (!isPlatformBrowser(this.platformId)) {
			// Always allow on server-side to prevent SSR issues
			return true
		}

		if (this.authService.isAuthenticated()) {
			return true
		} else {
			this.router.navigate(['/login'])
			return false
		}
	}
}
