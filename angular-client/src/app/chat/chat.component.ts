import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { CommonModule } from '@angular/common' // for *ngFor, *ngIf, [ngClass]
import { FormsModule } from '@angular/forms' // for [(ngModel)]
import { firstValueFrom } from 'rxjs'
import {ChatApiService} from '../../_services/chat.service'
import {environment} from '../../environments/environment'


type Msg = { sender: 'user' | 'assistant'; text: string }

@Component({
	selector: 'app-chat',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit {
	@ViewChild('messageContainer') messageContainer!: ElementRef<HTMLDivElement>

	messages: Msg[] = []
	userInput: string = ''
	sending = false
	consultationId: string | null = null

	constructor(private chatApi: ChatApiService) {}

	async ngOnInit() {
		await this.startConversation()
	}

	private async startConversation() {
		const artistId = environment['artistId'] || 'default-artist'
		try {
			const { id, message } = await firstValueFrom(
				this.chatApi.startConsultation(artistId)
			)
			this.consultationId = id || null
			this.messages = []
			this.pushAssistant(
				message ||
					'Hi! What subject or theme are you thinking of for your tattoo?'
			)
		} catch {
			this.pushAssistant(
				'Sorry—could not start the chat. Please refresh and try again.'
			)
		}
	}

	// HTML calls this
	async sendMessage() {
		const text = (this.userInput || '').trim()
		if (!text || !this.consultationId || this.sending) return

		this.sending = true
		this.pushUser(text)
		this.userInput = ''

		try {
			const reply = await firstValueFrom(
				this.chatApi.sendMessage(this.consultationId, text)
			)
			this.pushAssistant(reply || 'Thanks! (No reply text returned.)')
		} catch {
			this.pushAssistant('Oops—something went wrong. Please try again.')
		} finally {
			this.sending = false
		}
	}

	// Optional: hook up to a “Reset” button if you add one later
	async resetConversation() {
		this.consultationId = null
		this.messages = []
		await this.startConversation()
	}

	private pushAssistant(text: string) {
		if (!text) return
		this.messages.push({ sender: 'assistant', text })
		queueMicrotask(() => this.scrollToBottom())
	}

	private pushUser(text: string) {
		this.messages.push({ sender: 'user', text })
		queueMicrotask(() => this.scrollToBottom())
	}

	private scrollToBottom() {
		const el = this.messageContainer?.nativeElement
		if (el) el.scrollTop = el.scrollHeight
	}
}
