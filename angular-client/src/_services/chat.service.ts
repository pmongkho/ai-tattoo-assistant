import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../environments/environment'


export interface ChatMessage {
	message: string
}

@Injectable({
	providedIn: 'root',
})
export class ChatService {
	private apiUrl = environment.apiUrl

	constructor(private http: HttpClient) {}

	sendMessage(message: string): Observable<any> {
		const chatMessage: ChatMessage = { message }
		return this.http.post(`${this.apiUrl}/tattoo/consult`, chatMessage)
	}
}
