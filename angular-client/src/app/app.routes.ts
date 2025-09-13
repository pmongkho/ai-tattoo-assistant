import { Routes } from '@angular/router'
import { ChatComponent } from './chat/chat.component'
import { ConnectComponent } from './connect/connect.component'

export const routes: Routes = [
  { path: 'chat', component: ChatComponent },
  { path: 'connect', component: ConnectComponent },
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: '**', redirectTo: 'chat' },
]
