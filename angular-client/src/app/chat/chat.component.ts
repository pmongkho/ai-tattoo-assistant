import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core'
import { CommonModule } from '@angular/common' // for *ngFor, *ngIf, [ngClass]
import { FormsModule } from '@angular/forms' // for [(ngModel)]
import { firstValueFrom } from 'rxjs'
import { ChatApiService } from '../../_services/chat.service'
import { environment } from '../../environments/environment'


type Msg = {
        sender: 'user' | 'assistant'
        text: string
        imageUrl?: string
        pending?: boolean
}

@Component({
        selector: 'app-chat',
        standalone: true,
        imports: [CommonModule, FormsModule],
        templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, AfterViewInit {
        @ViewChild('messageContainer') messageContainer!: ElementRef<HTMLDivElement>

        messages: Msg[] = []
        userInput: string = ''
        sending = false
        consultationId: string = ''
        selectedFile: File | null = null
        private artistId = environment.artistId
        private readonly greeting =
                "Hey there! I'm your AI tattoo assistant. Share your ideas or reference photos and I'll help you plan the perfect design."

        constructor(private chatApi: ChatApiService) {}

        ngOnInit() {
                this.messages = [
                        {
                                sender: 'assistant',
                                text: this.greeting,
                        },
                ]
        }

        ngAfterViewInit(): void {
                this.scrollToBottom()
        }

        // HTML calls this
        async sendMessage() {
                const text = (this.userInput || '').trim()
                if ((!text && !this.selectedFile) || this.sending) return

                this.sending = true

                const preview = this.selectedFile
                        ? URL.createObjectURL(this.selectedFile)
                        : undefined
                this.pushUser(text, preview)
                this.userInput = ''

                this.pushAssistant('Thinking…', true)

                try {
                        if (!this.consultationId) {
                                const start = await firstValueFrom(
                                        this.chatApi.startConsultation(this.artistId)
                                )
                                this.consultationId = start.id
                        }

                        const reply = this.selectedFile
                                ? await firstValueFrom(
                                          this.chatApi.sendMessageWithImage(
                                                  this.consultationId,
                                                  text,
                                                  this.selectedFile
                                          )
                                  )
                                : await firstValueFrom(
                                          this.chatApi.sendMessage(
                                                  this.consultationId,
                                                  text
                                          )
                                  )

                        this.pushAssistant(reply || 'Thanks! (No reply text returned.)')
                } catch {
                        this.pushAssistant('Oops—something went wrong. Please try again.')
                } finally {
                        this.sending = false
                        this.selectedFile = null
                }
        }

        // Optional: hook up to a “Reset” button if you add one later
        resetConversation() {
                this.messages = [
                        {
                                sender: 'assistant',
                                text: this.greeting,
                        },
                ]
                this.consultationId = ''
        }

        private pushAssistant(text: string, pending = false) {
                if (!text) return

                if (pending) {
                        this.messages.push({ sender: 'assistant', text, pending: true })
                } else {
                        const pendingIndex = this.findLastPendingAssistantIndex()
                        if (pendingIndex !== -1) {
                                this.messages[pendingIndex] = { sender: 'assistant', text }
                        } else {
                                this.messages.push({ sender: 'assistant', text })
                        }
                }

                setTimeout(() => this.scrollToBottom())
        }

        private pushUser(text: string, imageUrl?: string) {
                this.messages.push({ sender: 'user', text, imageUrl })
                setTimeout(() => this.scrollToBottom())
        }

        onFileSelected(event: Event) {
                const input = event.target as HTMLInputElement
                if (input.files && input.files.length > 0) {
                        this.selectedFile = input.files[0]
                }
        }

        private scrollToBottom() {
                const el = this.messageContainer?.nativeElement
                if (el) el.scrollTop = el.scrollHeight
        }

        private findLastPendingAssistantIndex(): number {
                for (let i = this.messages.length - 1; i >= 0; i--) {
                        const msg = this.messages[i]
                        if (msg.sender === 'assistant' && msg.pending) {
                                return i
                        }
                }
                return -1
        }
}
