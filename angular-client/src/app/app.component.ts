import { Component, ChangeDetectorRef, OnInit } from '@angular/core'
import { ThemeService } from '../_services/theme.service'
import { RouterModule } from '@angular/router'
import { Observable } from 'rxjs'
import { CommonModule } from '@angular/common'

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	imports: [RouterModule, CommonModule]
})
export class AppComponent implements OnInit {
	title = 'AI Tattoo Assistant'
	isDarkMode$: Observable<boolean>
	htmlClass: string = ''

        constructor(
                public themeService: ThemeService,
                private cdr: ChangeDetectorRef
        ) {
                this.isDarkMode$ = this.themeService.darkMode$
        }

	ngOnInit(): void {
		// Check the current state of the HTML class
		this.updateHtmlClassState()

		// Subscribe to dark mode changes
		this.isDarkMode$.subscribe((isDark) => {
			console.log('Dark mode subscription updated:', isDark)
			this.updateHtmlClassState()
		})
	}

	/**
	 * Toggle between light and dark theme
	 */
	toggleTheme(): void {
		console.log('Toggle theme called in app component')

		// Get the current value
		const currentValue = this.themeService.getCurrentValue()
		console.log('Current value before toggle:', currentValue)

		// Toggle the theme
		this.themeService.toggleTheme()

		// Force change detection
		this.cdr.detectChanges()

		// Update HTML class state
		this.updateHtmlClassState()

		console.log(
			'After toggle, dark mode is:',
			this.themeService.getCurrentValue()
		)
	}

        /**
         * Get the current HTML class for debugging
         */
	getHtmlClass(): string {
		if (typeof document !== 'undefined') {
			return document.documentElement.classList.contains('dark')
				? 'dark'
				: 'light'
		}
		return 'unknown'
	}

	/**
	 * Update the HTML class state variable
	 */
	private updateHtmlClassState(): void {
		this.htmlClass = this.getHtmlClass()
		console.log('HTML class updated to:', this.htmlClass)
	}

	/**
	 * Force a refresh of the theme
	 */
	forceRefresh(): void {
		console.log('Force refresh called')

		// Get the current value
		const currentValue = this.themeService.getCurrentValue()
		console.log('Current dark mode value:', currentValue)

		// Force the theme to the opposite of current
		this.themeService.setDarkMode(!currentValue)

		// Force Angular to detect changes
		this.cdr.detectChanges()

		// Update HTML class state
		this.updateHtmlClassState()

		console.log(
			'After force refresh, dark mode is:',
			this.themeService.getCurrentValue()
		)
		console.log('HTML class is now:', this.getHtmlClass())
	}
}
