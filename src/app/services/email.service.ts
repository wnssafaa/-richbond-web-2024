import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitDTO } from './visit.service';

export interface EmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 content
  mimeType: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:8080/api/email';

  constructor(private http: HttpClient) { }

  /**
   * Envoie un email avec des pièces jointes
   */
  sendEmail(emailData: EmailData): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Génère un rapport de visite en PDF et l'envoie par email
   */
  sendVisitReport(visit: VisitDTO, recipients: string[], subject?: string, message?: string): Observable<any> {
    const emailData: EmailData = {
      to: recipients,
      subject: subject || `Rapport de visite #${visit.id} - ${visit.planning?.magasin?.nom || 'Magasin'}`,
      body: message || this.generateEmailBody(visit),
      attachments: this.generateVisitAttachments(visit)
    };

    return this.sendEmail(emailData);
  }

  /**
   * Génère le corps de l'email pour un rapport de visite
   */
  private generateEmailBody(visit: VisitDTO): string {
    const magasin = visit.planning?.magasin;
    const merchandiser = visit.planning?.merchandiser;
    
    return `
      <h2>Rapport de Visite #${visit.id}</h2>
      
      <h3>Informations de la visite</h3>
      <ul>
        <li><strong>Magasin:</strong> ${magasin?.nom || 'N/A'}</li>
        <li><strong>Adresse:</strong> ${magasin?.adresse || 'N/A'}</li>
        <li><strong>Ville:</strong> ${magasin?.ville || 'N/A'}</li>
        <li><strong>Région:</strong> ${magasin?.region || 'N/A'}</li>
      </ul>
      
      <h3>Détails de la visite</h3>
      <ul>
        <li><strong>Merchandiser:</strong> ${merchandiser ? `${merchandiser.nom} ${merchandiser.prenom}` : 'N/A'}</li>
        <li><strong>Heure d'arrivée:</strong> ${this.formatDateTime(visit.heureArrivee)}</li>
        <li><strong>Heure de départ:</strong> ${this.formatDateTime(visit.heureDepart)}</li>
        <li><strong>Nombre de facings:</strong> ${visit.nombreFacings} / ${visit.nombreFacingsTotal}</li>
        <li><strong>Prix normal:</strong> ${visit.prixNormal}€</li>
        <li><strong>Prix promotionnel:</strong> ${visit.prixPromotionnel}€</li>
        <li><strong>Niveau de stock:</strong> ${visit.niveauStock}%</li>
        <li><strong>Nouveauté concurrente:</strong> ${visit.nouveauteConcurrente}</li>
        <li><strong>Prix nouveauté:</strong> ${visit.prixNouveaute}€</li>
        <li><strong>Photo prise:</strong> ${visit.photoPrise ? 'Oui' : 'Non'}</li>
      </ul>
      
      ${visit.produits && visit.produits.length > 0 ? `
      <h3>Produits visités</h3>
      <ul>
        ${visit.produits.map(produit => `<li>${produit.nom} - ${produit.marque}</li>`).join('')}
      </ul>
      ` : ''}
      
      <p><em>Ce rapport a été généré automatiquement par le système Richbond.</em></p>
    `;
  }

  /**
   * Génère les pièces jointes pour un rapport de visite
   */
  private generateVisitAttachments(visit: VisitDTO): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];
    
    // Ajouter les images de la visite
    if (visit.images && visit.images.length > 0) {
      visit.images.forEach((image, index) => {
        if (image.imageData) {
          attachments.push({
            filename: `visite_${visit.id}_image_${index + 1}.jpg`,
            content: image.imageData.split(',')[1], // Enlever le préfixe data:image/jpeg;base64,
            mimeType: 'image/jpeg'
          });
        }
      });
    }

    return attachments;
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Valide une adresse email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide une liste d'adresses email
   */
  validateEmailList(emails: string[]): { valid: string[], invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    emails.forEach(email => {
      const trimmedEmail = email.trim();
      if (trimmedEmail && this.isValidEmail(trimmedEmail)) {
        valid.push(trimmedEmail);
      } else if (trimmedEmail) {
        invalid.push(trimmedEmail);
      }
    });

    return { valid, invalid };
  }
}
