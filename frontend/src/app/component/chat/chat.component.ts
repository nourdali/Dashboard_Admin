import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { QueryResult } from '../../models/document.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: Array<{ sender: string, text: string }> = [
    { sender: 'bot', text: 'Bonjour! Posez-moi des questions sur vos documents.' }
  ];
  userInput = '';
  selectedCategory = 'Tous';
  categories = ['Tous', 'SALLE DE BAINS', 'REVETEMENT', 'MENUISERIE EXTERIEURE'];
  isLoading = false;
  results: QueryResult[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({ sender: 'user', text: userMessage });
    this.userInput = '';
    this.isLoading = true;

    try {
      const response = await firstValueFrom(this.apiService.queryDocuments(
        userMessage,
        this.selectedCategory === 'Tous' ? undefined : this.selectedCategory
      ));

      this.results = response as QueryResult[];
      
      if (this.results.length > 0) {
        const botResponse = `J'ai trouvé ${this.results.length} résultat(s) pertinent(s).`;
        this.messages.push({ sender: 'bot', text: botResponse });
      } else {
        this.messages.push({ sender: 'bot', text: "Je n'ai pas trouvé de résultats pertinents." });
      }
    } catch (error) {
      this.messages.push({ sender: 'bot', text: "Désolé, une erreur s'est produite." });
    } finally {
      this.isLoading = false;
    }
  }
}