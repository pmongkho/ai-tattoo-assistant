// src/_services/auth.interceptor.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { isPlatformBrowser } from '@angular/common'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

	intercept(
		request: HttpRequest<unknown>,
		next: HttpHandler
	): Observable<HttpEvent<unknown>> {
		if (isPlatformBrowser(this.platformId)) {
			const token = localStorage.getItem('token')

			if (token) {
				request = request.clone({
					setHeaders: {
						Authorization: `Bearer ${token}`,
					},
				})
			}
		}

		return next.handle(request)
	}
}
