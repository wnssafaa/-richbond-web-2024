import { Injectable } from '@angular/core';
import { Role } from '../enum/Role';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  /**
   * Vérifie si l'utilisateur peut effectuer des actions d'écriture (ajouter, modifier, supprimer)
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur peut modifier, false sinon
   */
  canWrite(userRole: string): boolean {
    // Le consultant a seulement accès en lecture seule
    if (userRole === Role.CONSULTANT) {
      return false;
    }
    
    // Tous les autres rôles ont accès en écriture
    return true;
  }

  /**
   * Vérifie si l'utilisateur peut voir les données (accès en lecture)
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur peut voir les données
   */
  canRead(userRole: string): boolean {
    // Tous les rôles ont accès en lecture
    return true;
  }

  /**
   * Vérifie si l'utilisateur peut ajouter des éléments
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur peut ajouter
   */
  canAdd(userRole: string): boolean {
    return this.canWrite(userRole);
  }

  /**
   * Vérifie si l'utilisateur peut modifier des éléments
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur peut modifier
   */
  canEdit(userRole: string): boolean {
    return this.canWrite(userRole);
  }

  /**
   * Vérifie si l'utilisateur peut supprimer des éléments
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur peut supprimer
   */
  canDelete(userRole: string): boolean {
    return this.canWrite(userRole);
  }

  /**
   * Vérifie si l'utilisateur est consultant (accès lecture seule)
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur est consultant
   */
  isConsultant(userRole: string): boolean {
    return userRole === Role.CONSULTANT;
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur est admin
   */
  isAdmin(userRole: string): boolean {
    return userRole === Role.ADMIN;
  }

  /**
   * Vérifie si l'utilisateur est superviseur
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur est superviseur
   */
  isSuperviseur(userRole: string): boolean {
    return userRole === Role.SUPERVISEUR;
  }

  /**
   * Vérifie si l'utilisateur est merchandiseur
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur est merchandiseur (mono ou multi)
   */
  isMerchandiseur(userRole: string): boolean {
    return userRole === Role.MERCHANDISEUR_MONO || userRole === Role.MERCHANDISEUR_MULTI;
  }

  /**
   * Vérifie si l'utilisateur est responsable animateur
   * @param userRole - Le rôle de l'utilisateur connecté
   * @returns true si l'utilisateur est responsable animateur
   */
  isResponsableAnimateur(userRole: string): boolean {
    return userRole === Role.RESPONSABLE_ANIMATEUR;
  }

  /**
   * Retourne la liste des rôles disponibles pour la sélection
   * @returns Array des options de rôles
   */
  getAvailableRoles(): Array<{label: string, value: string, description: string}> {
    return [
      {
        label: 'Administrateur',
        value: Role.ADMIN,
        description: 'Accès complet à toutes les fonctionnalités'
      },
      {
        label: 'Superviseur',
        value: Role.SUPERVISEUR,
        description: 'Gère et supervise les merchandiseurs'
      },
      {
        label: 'Merchandiseur Mono',
        value: Role.MERCHANDISEUR_MONO,
        description: 'Gère les produits d\'une seule région'
      },
      {
        label: 'Merchandiseur Multi',
        value: Role.MERCHANDISEUR_MULTI,
        description: 'Gère les produits de plusieurs régions'
      },
      {
        label: 'Responsable Animateur',
        value: Role.RESPONSABLE_ANIMATEUR,
        description: 'Responsable/Animateur national - accès multi-régional'
      },
      {
        label: 'Consultant',
        value: Role.CONSULTANT,
        description: 'Consultant - accès lecture seule'
      }
    ];
  }
}







