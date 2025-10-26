import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { VisitDTO } from './visit.service';
import { environment } from '../../environments/environment';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface VisitReportEmailData {
  visit: VisitDTO;
  recipientEmail: string;
  customMessage?: string;
  includeImages?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `/api/api/email`;

  constructor(private http: HttpClient) { }

  /**
   * Envoie un email simple
   */
  sendEmail(emailOptions: EmailOptions): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/send`, emailOptions, { headers }).pipe(
      tap(response => {
        console.log('Email envoyÃ© avec succÃ¨s:', response);
      }),
      catchError(error => {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return throwError(() => new Error(
          error.error?.message || 
          'Erreur lors de l\'envoi de l\'email. VÃ©rifiez votre connexion.'
        ));
      })
    );
  }

  /**
   * Envoie un rapport de visite par email
   */
  sendVisitReport(emailData: VisitReportEmailData): Observable<any> {
    const emailOptions: EmailOptions = {
      to: emailData.recipientEmail,
      subject: `Rapport de visite #${emailData.visit.id} - ${emailData.visit.planning?.magasin?.nom || 'Magasin'}`,
      body: this.generateVisitReportEmailBody(emailData),
      attachments: this.generateVisitReportAttachments(emailData)
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * GÃ©nÃ¨re le corps de l'email pour le rapport de visite
   */
  private generateVisitReportEmailBody(emailData: VisitReportEmailData): string {
    const visit = emailData.visit;
    const customMessage = emailData.customMessage || '';
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #0A2681; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .visit-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .label { font-weight: bold; color: #0A2681; }
          .value { color: #666; }
          .images-section { margin: 20px 0; }
          .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
          .image-item { text-align: center; }
          .image-item img { max-width: 100%; height: auto; border-radius: 5px; }
          .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .custom-message { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport de Visite #${visit.id}</h1>
          <p>SystÃ¨me de Gestion Richbond</p>
        </div>
        
        <div class="content">
          ${customMessage ? `<div class="custom-message"><strong>Message personnalisÃ©:</strong><br>${customMessage}</div>` : ''}
          
          <div class="visit-info">
            <h3>Informations de la visite</h3>
            <div class="info-row">
              <span class="label">ID de la visite:</span>
              <span class="value">#${visit.id}</span>
            </div>
            <div class="info-row">
              <span class="label">Date de visite:</span>
              <span class="value">${this.formatDate(visit.planning?.dateVisite)}</span>
            </div>
            <div class="info-row">
              <span class="label">Heure d'arrivÃ©e:</span>
              <span class="value">${visit.heureArrivee || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Heure de dÃ©part:</span>
              <span class="value">${visit.heureDepart || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">DurÃ©e de visite:</span>
              <span class="value">${this.calculateDuration(visit.heureArrivee, visit.heureDepart)}</span>
            </div>
          </div>

          <div class="visit-info">
            <h3>Informations du magasin</h3>
            <div class="info-row">
              <span class="label">Nom du magasin:</span>
              <span class="value">${visit.planning?.magasin?.nom || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Adresse:</span>
              <span class="value">${visit.planning?.magasin?.adresse || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Ville:</span>
              <span class="value">${visit.planning?.magasin?.ville || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">RÃ©gion:</span>
              <span class="value">${visit.planning?.magasin?.region || 'N/A'}</span>
            </div>
          </div>

          <div class="visit-info">
            <h3>Informations du merchandiseur</h3>
            <div class="info-row">
              <span class="label">Nom complet:</span>
              <span class="value">${visit.planning?.merchandiser?.nom || 'N/A'} ${visit.planning?.merchandiser?.prenom || ''}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${visit.planning?.merchandiser?.email || 'N/A'}</span>
            </div>
          </div>

          <div class="visit-info">
            <h3>DÃ©tails de la visite</h3>
            <div class="info-row">
              <span class="label">Nombre de facings:</span>
              <span class="value">${visit.nombreFacings || 0}</span>
            </div>
            <div class="info-row">
              <span class="label">Nombre de facings total:</span>
              <span class="value">${visit.nombreFacingsTotal || 0}</span>
            </div>
            <div class="info-row">
              <span class="label">Prix normal:</span>
              <span class="value">${visit.prixNormal ? visit.prixNormal + ' MAD' : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Prix promotionnel:</span>
              <span class="value">${visit.prixPromotionnel ? visit.prixPromotionnel + ' MAD' : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Niveau de stock:</span>
              <span class="value">${visit.niveauStock || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">NouveautÃ© concurrente:</span>
              <span class="value">${visit.nouveauteConcurrente || 'Aucune'}</span>
            </div>
            <div class="info-row">
              <span class="label">Prix nouveautÃ©:</span>
              <span class="value">${visit.prixNouveaute ? visit.prixNouveaute + ' MAD' : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Photo prise:</span>
              <span class="value">${visit.photoPrise ? 'Oui' : 'Non'}</span>
            </div>
          </div>

          ${visit.produits && visit.produits.length > 0 ? `
          <div class="visit-info">
            <h3>Produits visitÃ©s</h3>
            ${visit.produits.map(produit => `
              <div class="info-row">
                <span class="label">${produit.nom || 'Produit'}:</span>
                <span class="value">${produit.categorie || 'N/A'}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${visit.images && visit.images.length > 0 && emailData.includeImages ? `
          <div class="images-section">
            <h3>Images de la visite</h3>
            <div class="image-grid">
              ${visit.images.map((image, index) => `
                <div class="image-item">
                  <img src="${this.getImageUrl(image)}" alt="Image ${index + 1} de la visite" />
                  <p>Image ${index + 1}</p>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="visit-info">
            <h3>Localisation</h3>
            <div class="info-row">
              <span class="label">CoordonnÃ©es GPS:</span>
              <span class="value">${visit.latitude && visit.longitude ? `${visit.latitude}, ${visit.longitude}` : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Ce rapport a Ã©tÃ© gÃ©nÃ©rÃ© automatiquement par le systÃ¨me Richbond</p>
          <p>Date de gÃ©nÃ©ration: ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `;

    return htmlBody;
  }

  /**
   * GÃ©nÃ¨re les piÃ¨ces jointes pour le rapport de visite
   */
  private generateVisitReportAttachments(emailData: VisitReportEmailData): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];
    const visit = emailData.visit;

    // GÃ©nÃ©rer un fichier CSV avec les donnÃ©es de la visite
    const csvContent = this.generateVisitReportCSV(visit);
    attachments.push({
      filename: `rapport_visite_${visit.id}.csv`,
      content: csvContent,
      contentType: 'text/csv'
    });

    // Ajouter les images si demandÃ©
    if (emailData.includeImages && visit.images && visit.images.length > 0) {
      visit.images.forEach((image, index) => {
        attachments.push({
          filename: `image_visite_${visit.id}_${index + 1}.jpg`,
          content: this.getImageBase64(image),
          contentType: 'image/jpeg'
        });
      });
    }

    return attachments;
  }

  /**
   * GÃ©nÃ¨re un fichier CSV avec les donnÃ©es de la visite
   */
  private generateVisitReportCSV(visit: VisitDTO): string {
    const headers = [
      'ID Visite', 'Date Visite', 'Heure ArrivÃ©e', 'Heure DÃ©part', 'DurÃ©e',
      'Magasin', 'Adresse', 'Ville', 'RÃ©gion',
      'Merchandiser', 'Email Merchandiser',
      'Nombre Facings', 'Nombre Facings Total', 'Prix Normal', 'Prix Promotionnel',
      'Niveau Stock', 'NouveautÃ© Concurrente', 'Prix NouveautÃ©', 'Photo Prise',
      'Latitude', 'Longitude'
    ];

    const row = [
      visit.id,
      this.formatDate(visit.planning?.dateVisite),
      visit.heureArrivee || '',
      visit.heureDepart || '',
      this.calculateDuration(visit.heureArrivee, visit.heureDepart),
      visit.planning?.magasin?.nom || '',
      visit.planning?.magasin?.adresse || '',
      visit.planning?.magasin?.ville || '',
      visit.planning?.magasin?.region || '',
      `${visit.planning?.merchandiser?.nom || ''} ${visit.planning?.merchandiser?.prenom || ''}`.trim(),
      visit.planning?.merchandiser?.email || '',
      visit.nombreFacings || 0,
      visit.nombreFacingsTotal || 0,
      visit.prixNormal || '',
      visit.prixPromotionnel || '',
      visit.niveauStock || '',
      visit.nouveauteConcurrente || '',
      visit.prixNouveaute || '',
      visit.photoPrise ? 'Oui' : 'Non',
      visit.latitude || '',
      visit.longitude || ''
    ];

    return [headers.join(','), row.map(cell => `"${cell}"`).join(',')].join('\n');
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('fr-FR');
    } catch {
      return dateString;
    }
  }

  /**
   * Calcule la durÃ©e entre deux heures
   */
  private calculateDuration(startTime: string | undefined, endTime: string | undefined): string {
    if (!startTime || !endTime) return 'N/A';
    
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      
      if (diffMs < 0) return 'N/A';
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      } else {
        return `${minutes}min`;
      }
    } catch {
      return 'N/A';
    }
  }

  /**
   * Obtient l'URL de l'image
   */
  private getImageUrl(image: any): string {
    if (typeof image === 'string') {
      if (image.startsWith('data:image')) {
        return image;
      }
      if (image.startsWith('http')) {
        return image;
      }
      return 'data:image/jpeg;base64,' + image;
    }
    return image.url || image.data || '';
  }

  /**
   * Obtient l'image en base64
   */
  private getImageBase64(image: any): string {
    if (typeof image === 'string') {
      if (image.startsWith('data:image')) {
        return image.split(',')[1]; // Retirer le prÃ©fixe data:image/...
      }
      return image;
    }
    return image.data || image.base64 || '';
  }

  /**
   * Valide une adresse email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}



