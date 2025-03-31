import { Routes } from '@angular/router';
import {ChatComponent} from './chat/chat.component';
import {LoginComponent} from './_components/login/login.component';
import {EmailVerificationComponent} from './_components/email-verification/email-verification.component';
import {AuthGuard} from '../_services/guards/auth.guard';

export const routes: Routes = [
	// { path: '', component: HomeComponent },
	// { path: 'chat', component: ChatComponent },

	{ path: 'login', component: LoginComponent },
	{ path: 'verify-email', component: EmailVerificationComponent }, // Add this route

	{
		path: 'chat',
		component: ChatComponent,
		canActivate: [AuthGuard],
	}, // ✅ Protect this route
	{ path: '**', redirectTo: 'login' }, // ✅ Redirect unknown routes
]
