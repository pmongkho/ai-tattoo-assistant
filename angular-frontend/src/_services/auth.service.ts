import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, firstValueFrom, from, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import {
	Auth,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
} from '@angular/fire/auth'
import { Router } from '@angular/router'
import { environment } from '../environment.prod'
import { isPlatformBrowser } from '@angular/common'

interface User {
	token: string
	email: string
	name?: string
	exp?: number
	refreshToken?: string
	[key: string]: any
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private url = `${environment.apiUrl}/auth`
	private userSubject = new BehaviorSubject<User | null>(null)
	user$ = this.userSubject.asObservable()
	private isBrowser: boolean
	private tokenExpirationTimer: any

	constructor(
		private http: HttpClient,
		private auth: Auth,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
		this.isBrowser = isPlatformBrowser(this.platformId)

		if (this.isBrowser) {
			this.initializeFromStorage()
		}
	}

	// Initialize user from localStorage
	private initializeFromStorage(): void {
		const token = localStorage.getItem('token')
		if (token) {
			try {
				const user = this.parseUserFromToken(token)

				// Check if token is expired
				if (user.exp) {
					const expirationDate = new Date(user.exp * 1000)
					if (expirationDate <= new Date()) {
						console.log('Stored token already expired, logging out')
						this.logout()
						return
					}

					// Set expiration timer
					this.setTokenExpirationTimer(expirationDate)
				}

				// Set user in subject
				this.userSubject.next(user)

				// Validate token with backend
				this.validateToken()
			} catch (error) {
				console.error('Error initializing from storage:', error)
				this.logout()
			}
		}
	}

	// ✅ Login via Email Magic Link with error handling
	loginWithEmail(email: string): Observable<any> {
		return this.http.post(`${this.url}/login-email`, { email }).pipe(
			tap((response) => console.log('Magic link sent successfully', response)),
			catchError((error) => {
				console.error('Error sending magic link:', error)
				return throwError(() => error)
			})
		)
	}

	// ✅ Verify Email Login - Updated to handle the verification process
	verifyEmailLogin(email: string, token: string): Observable<any> {
		return this.http.post(`${this.url}/verify-email`, { email, token }).pipe(
			tap((response: any) => {
				console.log('Email verification successful:', response)
				this.storeUserData(response)
				this.router.navigate(['/chat'])
			}),
			catchError((error) => {
				console.error('Email verification failed:', error)
				this.router.navigate(['/login'])
				return throwError(() => error)
			})
		)
	}

	// Validate token with backend
	validateToken(): void {
		this.http.get(`${this.url}/validate-token`).subscribe({
			next: (response: any) => {
				if (!response.valid) {
					this.logout()
				}
			},
			error: (error) => {
				console.error('Token validation error:', error)
				this.logout()
			},
		})
	}

	// Refresh the authentication token
	refreshToken(): Observable<any> {
		const refreshToken = this.getRefreshToken()
		if (!refreshToken) {
			return throwError(() => new Error('No refresh token available'))
		}

		return this.http.post(`${this.url}/refresh-token`, { refreshToken }).pipe(
			tap((response: any) => {
				if (response && response.token) {
					this.storeUserFromToken(response.token)
				}
			})
		)
	}

	private getRefreshToken(): string | null {
		const user = this.userSubject.value
		return user?.refreshToken || null
	}

	// ✅ Parse user from JWT token
	private parseUserFromToken(token: string): User {
		const tokenParts = token.split('.')
		if (tokenParts.length !== 3) {
			throw new Error('Invalid token format')
		}

		try {
			const payload = JSON.parse(atob(tokenParts[1]))
			return {
				token: token,
				email:
					payload.email ||
					payload[
						'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
					],
				name:
					payload.name ||
					payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
				exp: payload.exp,
			}
		} catch (e) {
			console.error('Error parsing token:', e)
			throw new Error('Failed to parse token')
		}
	}

	// ✅ Store user data from response
	private storeUserData(response: any): void {
		if (!this.isBrowser) return

		// Store token and user data
		localStorage.setItem('token', response.token)
		localStorage.setItem('user', JSON.stringify(response))
		this.userSubject.next(response)

		// Set expiration timer if token has expiration
		if (response.exp) {
			const expirationDate = new Date(response.exp * 1000)
			this.setTokenExpirationTimer(expirationDate)
		}
	}

	// ✅ Store user from JWT token directly
	public storeUserFromToken(token: string): void {
		if (!this.isBrowser) return

		try {
			const user = this.parseUserFromToken(token)

			localStorage.setItem('token', token)
			localStorage.setItem('user', JSON.stringify(user))
			this.userSubject.next(user)

			// Set expiration timer
			if (user.exp) {
				const expirationDate = new Date(user.exp * 1000)
				this.setTokenExpirationTimer(expirationDate)
			}
		} catch (error) {
			console.error('Error storing user from token:', error)
		}
	}

	// Set up automatic logout when token expires
	private setTokenExpirationTimer(expirationDate: Date): void {
		if (!this.isBrowser) return

		const expiresIn = expirationDate.getTime() - new Date().getTime()
		console.log(`Token expires in ${expiresIn / 1000} seconds`)

		// Clear any existing timer
		if (this.tokenExpirationTimer) {
			clearTimeout(this.tokenExpirationTimer)
		}

		this.tokenExpirationTimer = setTimeout(() => {
			console.log('Token expired, logging out')
			this.logout()
		}, expiresIn)
	}

	async googleLogin() {
		try {
			const provider = new GoogleAuthProvider()
			provider.setCustomParameters({ prompt: 'select_account' })

			const credentials = await signInWithPopup(this.auth, provider)

			if (!credentials.user) {
				throw new Error('No user returned from Google authentication')
			}

			// Get the Firebase ID token
			const idToken = await credentials.user.getIdToken()

			// Send the Firebase token to your backend
			const result = await firstValueFrom(
				this.http.post<any>(`${this.url}/login-google`, { idToken })
			)

			this.storeUserData(result)
			this.router.navigate(['/chat'])
			return result
		} catch (error) {
			console.error('Google login error:', error)
			throw error
		}
	}

	// ✅ Logout for Email & Google
	async logout(): Promise<void> {
		// Clear token expiration timer
		if (this.tokenExpirationTimer) {
			clearTimeout(this.tokenExpirationTimer)
			this.tokenExpirationTimer = null
		}

		// Clear local storage
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		this.userSubject.next(null)

		// If user was authenticated with Firebase, sign out from there too
		if (this.isBrowser && this.auth.currentUser) {
			try {
				await signOut(this.auth)
				console.log('User has signed out from Firebase')
			} catch (error) {
				console.warn('Error signing out from Firebase:', error)
			}
		}

		// // Optional: Call backend to invalidate the token
		// try {
		// 	// Use firstValueFrom instead of toPromise
		// 	await firstValueFrom(this.http.post(`${this.url}/logout`, {})).catch(
		// 		() => {
		// 			// Ignore errors from logout endpoint
		// 		}
		// 	)
		// } catch (error) {
		// 	// Ignore errors from logout endpoint
		// }

		// Navigate to login page
		this.router.navigate(['/login'])
	}

	// ✅ Check if user is authenticated
	isAuthenticated(): boolean {
		if (!this.isBrowser) return false

		const token = localStorage.getItem('token')
		if (!token) return false

		// Check if token is expired
		try {
			const user = JSON.parse(localStorage.getItem('user') || '{}')
			if (user.exp) {
				const expirationDate = new Date(user.exp * 1000)
				if (expirationDate <= new Date()) {
					console.log('Token expired')
					// Clean up expired token
					this.logout()
					return false
				}
			}
			return true
		} catch (e) {
			console.error('Error checking authentication:', e)
			return false
		}
	}
}
