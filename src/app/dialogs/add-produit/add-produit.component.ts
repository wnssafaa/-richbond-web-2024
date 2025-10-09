import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProduitService, Produit } from '../../services/produit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
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
  previewUrl: string | ArrayBuffer | null = null;

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
          disponible: produit.disponible,
          image: produit.image // base64 string
        });

        // Affichage image existante
        if (produit.image) {
          this.previewUrl = 'data:image/jpeg;base64,' + produit.image;
        }
      });
    }
  }

  private initializeForm(): void {
    this.produitForm = this.fb.group({
      marque: ['', Validators.required],
      reference: [''],
      categorie: ['', Validators.required],
      image: [''],
      article: ['', Validators.required],
      type: ['', Validators.required],
      dimensions: ['', Validators.required],
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
      this.selectedFile = file;

      // Créer un aperçu de l'image UNIQUEMENT (ne pas mettre en base64 dans le formulaire)
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result; // Juste pour l'affichage
        // ❌ NE PLUS METTRE L'IMAGE BASE64 DANS LE FORMULAIRE
        // Le fichier sera envoyé séparément avec FormData après la création du produit
      };
      reader.readAsDataURL(file);
      
      console.log('📁 Fichier sélectionné:', file.name, 'Taille:', file.size, 'bytes');
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.produitForm.patchValue({ image: null });
    this.produitForm.get('image')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.produitForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.produitForm);
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    // ⚠️ NE PAS INCLURE L'IMAGE BASE64 DANS LE JSON
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
      // ❌ NE PAS ENVOYER image en base64
      // image: this.produitForm.get('image')?.value,
      id: this.isEditMode ? this.editId : undefined
    };

    if (this.isEditMode) {
      // Mode édition
      this.produitService.updateProduit(this.editId, produit).subscribe({
        next: (response) => {
          // Si un nouveau fichier a été sélectionné, l'uploader
          if (this.selectedFile) {
            this.uploadImageForProduct(response.id!);
          } else {
            this.snackBar.open('Produit modifié avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(response);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la modification du produit', error);
          this.snackBar.open('Erreur lors de la modification du produit', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      // Mode création
      this.produitService.createProduit(produit).subscribe({
        next: (response) => {
          console.log('✅ Produit créé avec succès:', response);
          
          // Si un fichier image a été sélectionné, l'uploader maintenant
          if (this.selectedFile && response.id) {
            this.uploadImageForProduct(response.id);
          } else {
            this.snackBar.open('Produit ajouté avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(response);
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du produit', error);
          this.snackBar.open('Erreur lors de l\'ajout du produit: ' + (error.error?.message || error.message), 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  /**
   * Uploader l'image pour un produit (après sa création/modification)
   */
  private uploadImageForProduct(produitId: number): void {
    if (!this.selectedFile) {
      return;
    }

    console.log('📤 Upload de l\'image pour le produit:', produitId);
    
    this.produitService.uploadImage(produitId, this.selectedFile).subscribe({
      next: (imageResponse) => {
        console.log('✅ Image uploadée avec succès:', imageResponse);
        this.snackBar.open('Produit et image ajoutés avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close({ id: produitId, image: imageResponse });
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'upload de l\'image:', error);
        this.snackBar.open('Produit ajouté mais erreur lors de l\'upload de l\'image', 'Fermer', { duration: 5000 });
        // Fermer quand même le dialog avec le produit créé
        this.dialogRef.close({ id: produitId });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}