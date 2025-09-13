import { Routes } from '@angular/router'
import { ChatComponent } from './chat/chat.component'
import { ConnectComponent } from './connect/connect.component'
import { LandingComponent } from './landing/landing.component'

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'connect', component: ConnectComponent },
  { path: '**', redirectTo: '' },
]
