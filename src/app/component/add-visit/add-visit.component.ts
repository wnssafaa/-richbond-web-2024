import { Component, ElementRef, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanificationService } from '../../services/planification.service';
import { VisitDTO, VisitService, VisitImage } from '../../services/visit.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-visit',
  standalone: true,
  templateUrl: './add-visit.component.html',
  styleUrl: './add-visit.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ]
})
export class AddVisitComponent implements OnInit {
  visitForm!: FormGroup;
  planifications: any[] = [];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isUploading = false;
  uploadProgress = 0;
  isEditMode = false;
  visitId?: number;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private planifService: PlanificationService,
    private visitService: VisitService,
    private dialogRef: MatDialogRef<AddVisitComponent>,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit(): Promise<void> {
    this.initForm();
    await this.loadPlanifications();
    this.setupPlanningChangeListener();

    // Si data.visit existe, on est en mode édition
    if (this.data && this.data.visit) {
      this.isEditMode = true;
      this.visitId = this.data.visit.id;
      this.patchForm(this.data.visit);
    }
  }

  initForm(): void {
    this.visitForm = this.fb.group({
      planningId: ['', Validators.required],
      heureArrivee: ['', Validators.required],
      heureDepart: ['', Validators.required],
      nombreFacings: ['', Validators.required],
      nombreFacingsTotal: ['', Validators.required],
      prixNormal: ['', Validators.required],
      prixPromotionnel: ['', Validators.required],
      niveauStock: ['', Validators.required],
      nouveauteConcurrente: [''],
      prixNouveaute: [''],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      photoPrise: [false]
    });
  }

  loadPlanifications(): Promise<void> {
    return new Promise((resolve) => {
      this.planifService.getAllPlanifications().subscribe({
        next: (plans) => {
          this.planifications = plans;
          resolve();
        },
        error: (err) => {
          console.error('Erreur chargement planifications', err);
          resolve();
        }
      });
    });
  }

  setupPlanningChangeListener(): void {
    this.visitForm?.get('planningId')?.valueChanges.subscribe((planId: number) => {
      const plan = this.planifications.find(p => p.id === planId);
      if (plan) {
        const dateDebut = new Date(plan.dateVisite);
        const heureArrivee = dateDebut.toISOString().slice(0, 16);
        this.visitForm.patchValue({ heureArrivee });
        
        if (plan.dureeVisite) {
          const dateFin = new Date(dateDebut.getTime() + plan.dureeVisite * 60 * 60 * 1000);
          const heureDepart = dateFin.toISOString().slice(0, 16);
          this.visitForm.patchValue({ heureDepart });
        } else {
          this.visitForm.patchValue({ heureDepart: '' });
        }
      }
    });
  }

  patchForm(visit: VisitDTO): void {
    this.visitForm.patchValue({
      planningId: visit.planningId,
      heureArrivee: visit.heureArrivee?.slice(0, 16), // Pour input type="datetime-local"
      heureDepart: visit.heureDepart?.slice(0, 16),
      nombreFacings: visit.nombreFacings,
      nombreFacingsTotal: visit.nombreFacingsTotal,
      prixNormal: visit.prixNormal,
      prixPromotionnel: visit.prixPromotionnel,
      niveauStock: visit.niveauStock,
      nouveauteConcurrente: visit.nouveauteConcurrente,
      prixNouveaute: visit.prixNouveaute,
      latitude: visit.latitude,
      longitude: visit.longitude,
      photoPrise: visit.photoPrise
    });
    // Images déjà existantes (base64 ou URLs)
    if (visit.images && visit.images.length) {
      this.imagePreviews = visit.images.map(img => {
        if (typeof img === 'string') {
          return img;
        }
        return img.imageData || '';
      }).filter(img => img !== '');
    }
  }

  formatDateTime(dateTime: string): string {
    // Ensure the date string includes seconds
    if (dateTime.length === 16) { // "yyyy-MM-ddTHH:mm" format
        return dateTime + ':00'; // Add seconds
    }
    return dateTime;
}

  onSubmit(): void {
    if (this.visitForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isUploading = true;
    const formValue = this.visitForm.value;

    const filePromises = this.selectedFiles.map(file => this.toBase64(file));
    // Ajoute les images déjà présentes (si édition)
    const existingImages = this.isEditMode ? this.imagePreviews.filter(img => typeof img === 'string' && img.startsWith('data:image')) : [];

    Promise.all(filePromises).then((base64Images: string[]) => {
      // Convertir les images base64 en objets VisitImage
      const newImages: VisitImage[] = base64Images.map((base64, index) => ({
        imageData: base64,
        fileName: `image_${Date.now()}_${index}.jpg`,
        contentType: 'image/jpeg',
        uploadDate: new Date()
      }));

      // Convertir les images existantes en objets VisitImage si nécessaire
      const existingVisitImages: VisitImage[] = existingImages.map((base64, index) => ({
        imageData: base64,
        fileName: `existing_image_${index}.jpg`,
        contentType: 'image/jpeg',
        uploadDate: new Date()
      }));

      const visitData: VisitDTO = {
        planningId: formValue.planningId,
        heureArrivee: this.formatDateTime(formValue.heureArrivee),
        heureDepart: this.formatDateTime(formValue.heureDepart),
        nombreFacings: +formValue.nombreFacings,
        nombreFacingsTotal: +formValue.nombreFacingsTotal,
        prixNormal: +formValue.prixNormal,
        prixPromotionnel: +formValue.prixPromotionnel,
        niveauStock: +formValue.niveauStock,
        nouveauteConcurrente: formValue.nouveauteConcurrente,
        prixNouveaute: +formValue.prixNouveaute,
        latitude: +formValue.latitude,
        longitude: +formValue.longitude,
        photoPrise: formValue.photoPrise,
        images: [...existingVisitImages, ...newImages],
        produits: [],
        planning: {} as any
      };

      if (this.isEditMode && this.visitId) {
        this.visitService.updateVisit(this.visitId, visitData).subscribe({
          next: () => this.handleSuccess({ ...visitData, id: this.visitId }),
          error: (err) => {
            console.error(err);
            this.handleError(err);
          },
          complete: () => this.isUploading = false
        });
      } else {
        this.visitService.createVisit(visitData).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => {
            console.error(err);
            this.handleError(err);
          },
          complete: () => this.isUploading = false
        });
      }
    }).catch(error => {
      console.error("Erreur de conversion image:", error);
      this.isUploading = false;
    });
  }

  // Image compression function
  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set maximum dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with quality setting (0.7 = 70% quality)
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            
            // Create new File object with compressed image
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            resolve(compressedFile);
          }, 'image/jpeg', 0.7);
        };
        
        img.onerror = () => reject(new Error('Image loading error'));
      };
      
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }

  // Base64 converter
  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // File handling methods
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) continue;
        
        this.selectedFiles.push(file);
        this.createImagePreview(file);
      }
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  private handleSuccess(visit?: any): void {
    this.showSnackbar(this.isEditMode ? 'Visite modifiée avec succès' : 'Visite ajoutée avec succès', 'success-snackbar');
    this.dialogRef.close(visit || true);
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.showSnackbar('Erreur lors de l\'ajout de la visite', 'error-snackbar');
    this.isUploading = false;
  }

  private showSnackbar(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Fermer', { 
      duration: 3000, 
      panelClass: [panelClass] 
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}