import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProduitService, Produit, ProduitImageDTO } from '../../services/produit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarqueProduit } from '../../enum/MarqueProduit';

@Component({
  selector: 'app-add-produit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.css']
})
export class AddProduitComponent implements OnInit {
  produitForm!: FormGroup;
  isEditMode = false;
  editId!: number;
  magasins: string[] = ['Magasin A', 'Magasin B', 'Magasin C'];
  categories: string[] = [
    'Matelas', 
    'Sommier', 
    'Tête de lit',
    'Oreiller',
    'Couette',
    'Linge de lit',
    'Protection matelas',
    'Coussin',
    'Couverture',
    'Housse de couette',
    'Taie d\'oreiller',
    'Drap housse',
    'Drap plat',
    'Jeté de lit',
    'Plaid',
    'Couvre-lit',
    'Traversin',
    'Bord de lit',
    'Coussin de lit',
    'Accessoires de lit'
  ];
  types: string[] = [
    'Standard', 
    'Premium', 
    'Luxe',
    'Économique',
    'Professionnel',
    'Enfant',
    'Adulte',
    'Senior',
    'Orthopédique',
    'Naturel',
    'Synthetique',
    'Mixte',
    'Saison',
    'Toute saison'
  ];

  familles: string[] = [
    'MATELAS',
    'Oreiller',
    'Couette',
    'Linge'
  ];

  sousMarques: string[] = [
    'R VITAL',
    'R Ultima',
    'R Hello',
    'R Protect',
    'R Dorsal',
    'Confort Dorsal',
    'Confort Dorsal Premium',
    'BeautyDream',
    'DUOLUX',
    'DUO TOI ET MOI'
  ];
 marques: string[] = Object.values(MarqueProduit);
  selectedFile: File | null = null;
  currentImage: ProduitImageDTO | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddProduitComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { produit: Produit }
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    if (this.data?.produit) {
      this.isEditMode = true;
      this.editId = this.data.produit.id!;
      this.produitService.getProduitById(this.editId).subscribe((produit) => {
        this.produitForm.patchValue({
          marque: produit.marque,
          reference: produit.reference,
          categorie: produit.categorie,
          article: produit.article,
          type: produit.type,
          dimensions: produit.dimensions,
          prix: produit.prix,
          famille: produit.famille,
          sousMarques: produit.sousMarques,
          codeEAN: produit.codeEAN,
          designationArticle: produit.designationArticle,
          disponible: produit.disponible
        });

        // Charger l'image principale si elle existe
        if (produit.id) {
          this.loadPrimaryImage(produit.id);
        }
      });
    }
  }

  private initializeForm(): void {
    this.produitForm = this.fb.group({
      marque: ['', Validators.required],
      reference: [''],
      categorie: ['', Validators.required],
      article: ['', Validators.required],
      type: ['', Validators.required],
      dimensions: [''],
      prix: ['', [Validators.required, Validators.min(0.01)]],
      famille: ['', Validators.required],
      sousMarques: ['', Validators.required],
      codeEAN: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      designationArticle: [''],
      disponible: [true]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validation du fichier
      if (!this.validateImageFile(file)) {
        return;
      }

      this.selectedFile = file;

      // Créer une preview locale
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  private validateImageFile(file: File): boolean {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.', 'Fermer', { duration: 3000 });
      return false;
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.snackBar.open('Fichier trop volumineux. Taille maximale: 5MB.', 'Fermer', { duration: 3000 });
      return false;
    }

    return true;
  }

  clearFile() {
    // Nettoyer les URLs blob pour éviter les fuites mémoire
    if (this.previewUrl && typeof this.previewUrl === 'string' && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    
    this.selectedFile = null;
    this.previewUrl = null;
    this.currentImage = null;
  }

  onSubmit() {
    if (this.produitForm.invalid) {
      return;
    }

    this.isUploading = true;

    const produit: Produit = {
      marque: this.produitForm.get('marque')?.value,
      reference: this.produitForm.get('reference')?.value,
      categorie: this.produitForm.get('categorie')?.value,
      article: this.produitForm.get('article')?.value,
      type: this.produitForm.get('type')?.value,
      dimensions: this.produitForm.get('dimensions')?.value,
      prix: this.produitForm.get('prix')?.value,
      famille: this.produitForm.get('famille')?.value,
      sousMarques: this.produitForm.get('sousMarques')?.value,
      codeEAN: this.produitForm.get('codeEAN')?.value,
      designationArticle: this.produitForm.get('designationArticle')?.value,
      disponible: this.produitForm.get('disponible')?.value,
      id: this.isEditMode ? this.editId : undefined
    };

    if (this.isEditMode) {
      // Mode édition
      this.produitService.updateProduit(this.editId, produit).subscribe({
        next: (response) => {
          // Si une nouvelle image est sélectionnée, l'uploader
          if (this.selectedFile) {
            this.uploadImageForProduct(response.id!);
          } else {
            this.isUploading = false;
          this.snackBar.open('Produit modifié avec succès', 'Fermer', { duration: 3000 });
         this.dialogRef.close(response); 
          }
        },
        error: (error) => {
          this.isUploading = false;
          console.error('Erreur lors de la modification du produit', error);
          this.snackBar.open('Erreur lors de la modification du produit', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      // Mode création
     this.produitService.createProduit(produit).subscribe({
  next: (response) => {
          // Si une image est sélectionnée, l'uploader
          if (this.selectedFile) {
            this.uploadImageForProduct(response.id!);
          } else {
            this.isUploading = false;
    this.snackBar.open('Produit ajouté avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(response);
          }
  },
        error: (error) => {
          this.isUploading = false;
          console.error('Erreur lors de l\'ajout du produit', error);
          this.snackBar.open('Erreur lors de l\'ajout du produit', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  private uploadImageForProduct(produitId: number): void {
    if (!this.selectedFile) {
      this.isUploading = false;
      return;
    }

    // Utiliser le nouveau système d'upload de fichiers
    this.produitService.uploadImage(produitId, this.selectedFile, 'Image principale du produit').subscribe({
      next: (imageResponse) => {
        this.isUploading = false;
        const successMessage = this.isEditMode ? 'Produit modifié avec succès' : 'Produit ajouté avec succès';
        this.snackBar.open(successMessage, 'Fermer', { duration: 3000 });
        
        // Retourner les données du produit avec les informations de l'image
        this.dialogRef.close({ 
          ...this.produitForm.value, 
          id: produitId,
          imageData: imageResponse,
          imageUrl: this.produitService.getImageUrl(produitId, imageResponse.id!),
          thumbnailUrl: this.produitService.getThumbnailUrl(produitId, imageResponse.id!)
        });
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Erreur lors de l\'upload de l\'image', error);
        this.snackBar.open('Produit créé mais erreur lors de l\'upload de l\'image', 'Fermer', { duration: 5000 });
        
        // Fermer le dialog même en cas d'erreur d'upload d'image
        this.dialogRef.close({ 
          ...this.produitForm.value, 
          id: produitId
        });
      }
    });
  }

  private loadPrimaryImage(produitId: number): void {
    // Charger l'image principale du produit depuis l'API
    this.produitService.getImageByProduit(produitId).subscribe({
      next: (imageData) => {
        if (imageData && imageData.id) {
          // Charger l'image comme blob URL pour l'affichage
          this.produitService.loadImageAsBlobUrl(produitId, imageData.id).subscribe({
            next: (blobUrl) => {
              this.previewUrl = blobUrl;
              this.currentImage = imageData;
            },
            error: (error) => {
              console.warn('Impossible de charger l\'image blob pour le produit', produitId, error);
            }
          });
        }
      },
      error: (error) => {
        console.log('Aucune image trouvée pour le produit', produitId);
        // Pas d'erreur, le produit n'a simplement pas d'image
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}