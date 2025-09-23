import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionStateService {
  private submissionInProgress = new BehaviorSubject<boolean>(false);
  private lastSubmissionTime = 0;
  private submissionId = 0;

  constructor() { }

  canSubmit(): boolean {
    const currentTime = Date.now();
    const timeSinceLastSubmission = currentTime - this.lastSubmissionTime;
    
    // Vérifier si une soumission est en cours
    if (this.submissionInProgress.value) {
      console.log('🚫 Soumission bloquée : déjà en cours');
      return false;
    }
    
    // Vérifier le délai minimum (10 secondes)
    if (timeSinceLastSubmission < 10000) {
      console.log('🚫 Soumission bloquée : délai de protection (', timeSinceLastSubmission, 'ms)');
      return false;
    }
    
    return true;
  }

  startSubmission(): string {
    if (!this.canSubmit()) {
      throw new Error('Soumission non autorisée');
    }
    
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.submissionInProgress.next(true);
    this.lastSubmissionTime = Date.now();
    this.submissionId++;
    
    console.log('🔄 Début de soumission autorisée:', submissionId);
    return submissionId;
  }

  endSubmission(submissionId: string): void {
    console.log('✅ Fin de soumission:', submissionId);
    this.submissionInProgress.next(false);
  }

  isSubmissionInProgress(): boolean {
    return this.submissionInProgress.value;
  }

  getSubmissionState() {
    return this.submissionInProgress.asObservable();
  }
}

