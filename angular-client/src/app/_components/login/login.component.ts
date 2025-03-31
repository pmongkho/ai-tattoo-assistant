import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { AuthService } from '../../../_services/auth.service'

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
	standalone: true, // Add this line
	imports: [CommonModule, FormsModule],
})
export class LoginComponent {
	email: string = ''
	isLoading: boolean = false
	errorMessage: string | null = null

	constructor(protected authService: AuthService) {}

	// ✅ Login via Email Magic Link
	loginWithEmail() {
		if (!this.email) {
			this.errorMessage = 'Please enter your email address'
			return
		}

		this.isLoading = true
		this.errorMessage = null

		this.authService.loginWithEmail(this.email).subscribe({
			next: (response) => {
				this.isLoading = false
				alert('Check your email for the login link.')
			},
			error: (error) => {
				this.isLoading = false
				this.errorMessage = 'Failed to send login link. Please try again.'
				console.error('Error:', error)
			},
		})
	}

	// ✅ Login via Google OAuth
	async loginWithGoogle() {
		this.isLoading = true
		this.errorMessage = null

		try {
			await this.authService.googleLogin()
		} catch (error) {
			this.errorMessage = 'Google login failed. Please try again.'
			console.error('Google Auth Error:', error)
		} finally {
			this.isLoading = false
		}
	}
}
