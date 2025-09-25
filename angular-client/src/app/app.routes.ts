import { Routes } from '@angular/router'
import { ChatComponent } from './chat/chat.component'
import { ConnectComponent } from './connect/connect.component'
import { LandingComponent } from './landing/landing.component'
import { TermsComponent } from './terms/terms.component'
import { PrivacyComponent } from './privacy/privacy.component'
import { DataDeletionComponent } from './data-deletion/data-deletion.component'

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'connect', component: ConnectComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'data-deletion', component: DataDeletionComponent },
  { path: '**', redirectTo: '' },
]
