// src/app/_components/email-verification/email-verification.component.ts
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../../../_services/auth.service'
import { CommonModule } from '@angular/common'

@Component({
	selector: 'app-email-verification',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="verification-container">
			<p>{{ message }}</p>
		</div>
	`,
	styles: [
		`
			.verification-container {
				text-align: center;
				margin-top: 50px;
				padding: 20px;
				background-color: #f5f5f5;
				border-radius: 8px;
				max-width: 400px;
				margin-left: auto;
				margin-right: auto;
			}
		`,
	],
})
export class EmailVerificationComponent implements OnInit {
	message = 'Verifying your email...'

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService
	) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			const email = params['email']
			const token = params['token']

			if (email && token) {
				try {
					// Store the token directly - no need for another API call
					this.authService.storeUserFromToken(token)
					this.message = 'Verification successful! Redirecting...'

					// Redirect after a short delay
					setTimeout(() => {
						this.router.navigate(['/chat'])
					}, 1500)
				} catch (error) {
					console.error('Verification error:', error)
					this.message = 'Verification failed. Please try again.'

					// Redirect to login after a delay
					setTimeout(() => {
						this.router.navigate(['/login'])
					}, 2000)
				}
			} else {
				this.message = 'Invalid verification link. Redirecting to login...'

				// Redirect to login after a delay
				setTimeout(() => {
					this.router.navigate(['/login'])
				}, 2000)
			}
		})
	}
}
