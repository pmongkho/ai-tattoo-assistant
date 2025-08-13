import {
	ApplicationConfig,
	importProvidersFrom,
	provideZoneChangeDetection,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'
import {
	BrowserModule,
	provideClientHydration,
	withEventReplay,
} from '@angular/platform-browser'
import {
	provideHttpClient,
	withFetch,
	withInterceptorsFromDi,
} from '@angular/common/http'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { initializeApp, provideFirebaseApp } from '@angular/fire/app'
import { getAuth, provideAuth } from '@angular/fire/auth'
import { AuthInterceptor } from '../_services/auth.interceptor'

export const appConfig: ApplicationConfig = {
	providers: [
		// Use withInterceptorsFromDi to support class-based interceptors
		provideHttpClient(withFetch(), withInterceptorsFromDi()),
		// Register the class-based interceptor
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
		importProvidersFrom(BrowserModule, FormsModule),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		// provideClientHydration(withEventReplay()),
		provideFirebaseApp(() =>
			initializeApp({
				projectId: 'ai-tattoo-assistant',
				appId: '1:605619790926:web:002610f0e4f6a8a3ab8f1f',
				storageBucket: 'ai-tattoo-assistant.firebasestorage.app',
				apiKey: 'AIzaSyBqLP0Bmromi20sUxuxtpS37DXmMMjbc5o',
				authDomain: 'ai-tattoo-assistant.firebaseapp.com',
				messagingSenderId: '605619790926',
				measurementId: 'G-J0BRQKWF1B',
			})
		),
		provideAuth(() => getAuth()),
	],
}
