import {
	Component,
	ViewChild,
	ElementRef,
	AfterViewChecked,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ChatService } from '../../_services/chat.service'

interface Message {
	text: string
	sender: 'user' | 'ai'
}

@Component({
	selector: 'app-chat',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewChecked {
	@ViewChild('messageContainer') private messageContainer!: ElementRef // Add the non-null assertion operator

	messages: Message[] = []
	userInput = ''

	constructor(private chatService: ChatService) {}

	ngAfterViewChecked() {
		this.scrollToBottom()
	}

	scrollToBottom(): void {
		try {
			if (this.messageContainer) {
				// Add a check to ensure messageContainer exists
				this.messageContainer.nativeElement.scrollTop =
					this.messageContainer.nativeElement.scrollHeight
			}
		} catch (err) {
			console.error('Error scrolling to bottom:', err)
		}
	}

	sendMessage(): void {
		if (!this.userInput.trim()) return

		// Add user's message locally
		this.messages.push({ text: this.userInput, sender: 'user' })

		const userMessage = this.userInput
		this.userInput = '' // Clear input immediately for better UX

		// Call the .NET API
		this.chatService.sendMessage(userMessage).subscribe({
			next: (data) => {
				this.messages.push({ text: data.response, sender: 'ai' })
				// Scroll happens automatically due to ngAfterViewChecked
			},
			error: (err) => {
				console.error(err)
				this.messages.push({
					text: 'Error: Unable to get a response.',
					sender: 'ai',
				})
			},
		})
	}
}
