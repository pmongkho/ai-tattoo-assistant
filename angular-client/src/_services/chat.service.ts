import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, Observable } from 'rxjs'
import { environment } from '../environments/environment'

export interface StartResponse {
        consultationId: string
        response: string // initial assistant reply

}

export interface MessageResponse {
        response: string // assistant reply
}

export interface ConsultationDto {
	id: string
	style: string | null
	bodyPart: string | null
	imageUrl: string | null
	size: string | null
	priceExpectation: string | null
	availability: string | null
	status: string | null
	chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
}

@Injectable({ providedIn: 'root' })
export class ChatApiService {
        private apiUrl = environment.apiUrl

        constructor(private http: HttpClient) {}

	startConsultation(artistId: string) {
		const body = {
			artistId, // <-- real value
			squareArtistId: 'TM5aja5TzIaHzSZl',
		}

                return this.http
                        .post<StartResponse>(`${this.apiUrl}/consultations/start`, body)
                        .pipe(
                                map((r) => ({
                                        id: r.consultationId ?? '',
                                        message: r.response ?? '',
                                }))
                        )
        }


	sendMessage(consultationId: string, message: string): Observable<string> {
                return this.http
                        .post<MessageResponse>(
                                `${this.apiUrl}/consultations/${consultationId}/message`,
                                { message }
                        )
                        .pipe(map((r) => r.response ?? ''))
	}

        getConsultation(consultationId: string): Observable<ConsultationDto> {
                return this.http.get<ConsultationDto>(
                        `${this.apiUrl}/consultations/${consultationId}`
                )
        }

        // New helper for the TattooController-based chat endpoint
        sendTattooMessage(userId: string, message: string): Observable<string> {
                return this.http
                        .post<MessageResponse>(`${this.apiUrl}/tattoo/consult`, {
                                userId,
                                message,
                        })
                        .pipe(map((r) => r.response ?? ''))
        }
}
