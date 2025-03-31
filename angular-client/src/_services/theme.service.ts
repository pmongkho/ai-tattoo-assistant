// src/_services/theme.service.ts
import {
	Injectable,
	PLATFORM_ID,
	Inject,
	Renderer2,
	RendererFactory2,
	NgZone,
	ApplicationRef,
} from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { isPlatformBrowser } from '@angular/common'

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private darkMode = new BehaviorSubject<boolean>(false)
	darkMode$ = this.darkMode.asObservable()
	private isBrowser: boolean
	private renderer: Renderer2

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		rendererFactory: RendererFactory2,
		private ngZone: NgZone,
		private appRef: ApplicationRef
	) {
		this.isBrowser = isPlatformBrowser(this.platformId)
		this.renderer = rendererFactory.createRenderer(null, null)

		if (this.isBrowser) {
			// Check if dark mode is already applied to the document
			const isDarkModeActive =
				document.documentElement.classList.contains('dark')
			this.darkMode.next(isDarkModeActive)
			console.log('Initial dark mode state:', isDarkModeActive)
		}
	}

	// Add this method to get the current value
	getCurrentValue(): boolean {
		return this.darkMode.value
	}

	setDarkMode(isDark: boolean): void {
		console.log('Setting dark mode to:', isDark)

		// Update the BehaviorSubject first
		this.darkMode.next(isDark)

		if (this.isBrowser) {
			try {
				// Use renderer for DOM manipulations
				if (isDark) {
					this.renderer.addClass(document.documentElement, 'dark')
				} else {
					this.renderer.removeClass(document.documentElement, 'dark')
				}

				// Store preference in localStorage
				localStorage.setItem('theme', isDark ? 'dark' : 'light')

				// Set transition using renderer
				this.renderer.setStyle(
					document.body,
					'transition',
					'background-color 0.3s ease'
				)

				console.log(
					'Dark mode class applied:',
					document.documentElement.classList.contains('dark')
				)

				// Trigger change detection
				this.appRef.tick()
			} catch (e) {
				console.error('Error setting dark mode:', e)
			}
		}
	}

	toggleTheme(): void {
		console.log('Toggle button clicked')
		const currentValue = this.darkMode.value
		console.log('Current dark mode value before toggle:', currentValue)
		console.log(
			'HTML class before toggle:',
			document.documentElement.classList.contains('dark')
		)

		this.setDarkMode(!currentValue)

		console.log('New dark mode value after toggle:', this.darkMode.value)
		console.log(
			'HTML class after toggle:',
			document.documentElement.classList.contains('dark')
		)
	}
}
