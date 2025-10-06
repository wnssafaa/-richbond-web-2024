import { Component, OnInit, ViewChild } from '@angular/core';
import { ProduitService, Produit } from '../../services/produit.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdduserComponent } from '../adduser/adduser.component';
import { MerchendiseurService, Merchendiseur } from '../../services/merchendiseur.service';
import { AddMerchComponent } from '../../dialogs/add-merch/add-merch.component';
import{ MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {  AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Region } from '../../enum/Region';
import { Role } from '../../enum/Role';
import { AddProduitComponent } from '../../dialogs/add-produit/add-produit.component';
import { MatDrawer } from '@angular/material/sidenav';
import { MarqueProduit } from '../../enum/MarqueProduit';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { ConfirmLogoutComponent } from '../../dialogs/confirm-logout/confirm-logout.component';
import { ProduitDetailComponent } from '../../dialogs/produit-detail/produit-detail.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [
    CommonModule, MatSortModule, MatSidenavModule, MatCardModule, FormsModule, MatDialogModule,TranslateModule,
    MatCheckboxModule, MatToolbarModule, MatTableModule, MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatBadgeModule, MatChipsModule,MatTooltipModule,
    MatSlideToggleModule, MatMenuModule, MatListModule, HttpClientModule,RouterLink,MatPaginatorModule,RouterModule
  ],
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit, AfterViewInit {
openUserDetails(_t288: any) {
throw new Error('Method not implemented.');
}
  username: any;
  email: any;
  role: any;
 
    exportToExcel(): void {
       this.exportService.exportProduits(this.dataSource.data, {
         filename: 'produits',
         sheetName: 'Produits'
       });
     }
    displayedColumns: string[] = [
      'marque', 'reference', 'categorie', 'image',
      'article', 'dimensions', 'prix',
      'famille', 'sousMarques', 'codeEAN', 
      'actions'
    ];
    dataSource = new MatTableDataSource<Produit>();
    selection = new SelectionModel<Produit>(true, []);
    showFilters = false;
    menuOpen = true;
    searchText = '';
  
    // Configuration des filtres
    filters = {
      marque: '',
      reference: '',
      categorie: '',
      article: '',
      type: '',
      dimensions: '',
      famille: ''
    };
  
    // Options des filtres
    categories: string[] = ['Matelas', 'Sommier', 'Tête de lit'];
    dimensionsOptions: string[] = ['190×140', '190×160', '200×200'];
    types: string[] = ['Standard', 'Premium', 'Luxe'];
    marques: string[] = Object.values(MarqueProduit);
    familles: string[] = ['MATELAS', 'Oreiller', 'Couette', 'Linge'];
    articles: string[] = [];
  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    
   currentLanguage = 'fr';
    constructor(
      private produitService: ProduitService,
      private snackBar: MatSnackBar,
      private dialog: MatDialog, 
      private athService:AuthService,
      private router: Router,
      private translate: TranslateService,
      private exportService: ExportService
    ) {
          this.translate.setDefaultLang('fr');
  this.translate.use('fr');
    }
 @ViewChild(MatDrawer) drawer!: MatDrawer;
  onToggleDashboard(event: any): void {
  if (event.checked) {
    this.router.navigate(['/Dashbord']);
  }}
  toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
        nom: string | undefined;
  prenom: string | undefined;
  telephone: string | undefined;
  avatarUrl: string | undefined;
  imagePath: string | undefined;
  status: string | undefined;
 loadCurrentUser(): void {
  this.athService.getCurrentUserInfo().subscribe({
    next: (data) => {
      this.username = data.username ?? '';
      this.role = data.role ?? '';
      this.email = data.email ?? '';
      this.nom = data.nom ?? '';
      this.prenom = data.prenom ?? '';
      this.telephone = data.telephone ?? '';
      this.status = data.status ?? '';
      this.imagePath = data.imagePath ?? '';
      // Gestion de l'avatar : base64 ou URL
      this.avatarUrl = data.imagePath
        ? (data.imagePath.startsWith('data:image') ? data.imagePath : 'http://localhost:8080/uploads/' + data.imagePath)
        : 'assets/default-avatar.png';
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des infos utilisateur :', err);
    }
  });
}
    changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
  }
    toggleDrawer(action: 'open' | 'close') {
      if (action === 'open') {
        this.drawer.open();
      } else {
        this.drawer.close();
      }
    }
    ngOnInit(): void {
      this.loadProduits();
      this.setupCustomFilter();
      this.loadCurrentUser();
    }
  
    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  
  
   // Méthode pour la sélection/désélection de toutes les lignes
   masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  // Vérifie si toutes les lignes sont sélectionnées
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
// Ajouter cette nouvelle propriété
dataSourceFilter = {
  searchText: '',
  filters: {
    marque: '',
    reference: '',
    categorie: '',
    article: '',
    type: '',
    dimensions: '',
    famille: ''
  }
};

private setupCustomFilter(): void {
  this.dataSource.filterPredicate = (data: Produit, filter: string) => {
    const filterObj = JSON.parse(filter);
    const searchText = filterObj.searchText ? filterObj.searchText.toLowerCase() : '';
    
    // Recherche globale dans toutes les colonnes
    let matchesSearch = false;
    if (searchText) {
      matchesSearch = 
        (data.marque?.toLowerCase().includes(searchText)) ||
        (data.reference?.toLowerCase().includes(searchText)) ||
        (data.categorie?.toLowerCase().includes(searchText)) ||
        (data.article?.toLowerCase().includes(searchText)) ||
        (data.type?.toLowerCase().includes(searchText)) ||
        (data.dimensions?.toLowerCase().includes(searchText)) ||
        (data.famille?.toLowerCase().includes(searchText)) ||
        (data.sousMarques?.toLowerCase().includes(searchText)) ||
        (data.codeEAN?.toLowerCase().includes(searchText)) ||
        (data.designationArticle?.toLowerCase().includes(searchText));
    } else {
      matchesSearch = true;
    }

    // Filtres individuels
    const matchesMarque = filterObj.filters.marque ? 
      data.marque?.toLowerCase().includes(filterObj.filters.marque.toLowerCase()) : true;
    const matchesCategorie = filterObj.filters.categorie ? 
      data.categorie?.toLowerCase().includes(filterObj.filters.categorie.toLowerCase()) : true;
    const matchesArticle = filterObj.filters.article ? 
      data.article?.toLowerCase().includes(filterObj.filters.article.toLowerCase()) : true;
    const matchesType = filterObj.filters.type ? 
      data.type?.toLowerCase().includes(filterObj.filters.type.toLowerCase()) : true;
    const matchesDimensions = filterObj.filters.dimensions ? 
      data.dimensions?.toLowerCase().includes(filterObj.filters.dimensions.toLowerCase()) : true;
    const matchesFamille = filterObj.filters.famille ? 
      data.famille?.toLowerCase().includes(filterObj.filters.famille.toLowerCase()) : true;

    return matchesSearch && 
           matchesMarque && 
           matchesCategorie && 
           matchesArticle && 
           matchesType && 
           matchesDimensions &&
           matchesFamille;
  };
}
  // Filtrer les superviseurs
  applyFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
applyFilters(): void {
  // Mettre à jour les valeurs de filtre
  this.dataSourceFilter.searchText = this.searchText;
  this.dataSourceFilter.filters = { ...this.filters };
  
  this.dataSource.filter = JSON.stringify(this.dataSourceFilter);
}

resetFilters(): void {
  this.filters = {
    marque: '',
    reference: '',
    categorie: '',
    article: '',
    type: '',
    dimensions: '',
    famille: ''
  };
  this.searchText = '';
  this.applyFilters();
}
  
    loadProduits(): void {
      this.produitService.getAllProduits().subscribe({
        next: (produits: Produit[]) => {
          this.dataSource.data = produits;
          // Charger les articles uniques pour le filtre
          this.articles = [...new Set(produits.map(p => p.article).filter(article => article))];
        },
        error: () => {
          this.snackBar.open("Erreur lors du chargement des produits.", 'Fermer', { duration: 3000 });
        }
      });
    }

 
      ajouterProduit(): void {
        const dialogRef = this.dialog.open(AddProduitComponent, {
          width: '700px',
          data: { mode: 'add' }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Le produit a déjà été créé dans le dialog, on recharge juste la liste
            this.loadProduits();
          }
        });
      }
    
      viewProduit(produit: Produit): void {
        this.dialog.open(AddProduitComponent, {
          width: '700px',
          data: { mode: 'view', produit }
        });
      }
    
      editProduit(produit: Produit): void {
        const dialogRef = this.dialog.open(AddProduitComponent, {
          width: '700px',
          data: { mode: 'edit', produit }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.produitService.updateProduit(produit.id!, result).subscribe({
              next: () => {
                this.snackBar.open('Produit modifié avec succès', 'Fermer', { duration: 3000 });
                this.loadProduits();
              },
              error: () => {
                this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
              }
            });
          }
        });
      }

      deleteProduit(produit: Produit): void {
        if (!produit.id) {
          console.error('Produit sans ID:', produit);
          return;
        }
      
        if (confirm(`Supprimer le produit "${produit.article}" ?`)) {
          this.produitService.deleteProduit(produit.id).subscribe({
            next: () => {
              this.snackBar.open('Produit supprimé', 'Fermer', { duration: 2000 });
              this.loadProduits();
            },
            error: (err) => {
              console.error('Erreur de suppression:', err);
              this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
            }
          });
        }
      }
deleteSuperviseur(produitid: number): void {
  const confirmation = window.confirm("Voulez-vous vraiment supprimer ce magasin ?");

  if (confirmation) {
    this.produitService.deleteProduit(produitid).subscribe(
      () => {
        this.snackBar.open('produit supprimé avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadProduits();
      },
      error => {
        console.error('Erreur de suppression', error);
        this.snackBar.open("Erreur lors de la suppression", "Fermer", {
          duration: 3000
        });
      }
    );
  }
}
 logout(): void {
        this.athService.logout();
      }
      openLogoutDialog(): void {
                    const dialogRef = this.dialog.open(ConfirmLogoutComponent, {
                    width: '700px',
                  });
            
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  // Si l'utilisateur confirme, rediriger vers la page de login
                  this.logout();
                }
              });
            }
              openPtoduitDetails(produit: Produit): void {
              this.router.navigate(['/produit-detail', produit.id]);
            }
onRowClick(event: MouseEvent, row: Produit): void {
  const target = event.target as HTMLElement;
  
  // Vérifie spécifiquement les boutons edit/delete via leurs classes
  const isEditOrDelete = target.closest('.edit-button') || 
                        target.closest('.delete-button') ||
                        target.closest('mat-icon')?.parentElement?.classList.contains('edit-button') ||
                        target.closest('mat-icon')?.parentElement?.classList.contains('delete-button');

  if (isEditOrDelete) {
    return;
  }

  // Navigation vers la page de détail au lieu du dialog
  this.router.navigate(['/produit-detail', row.id]);
}
 userMenuOpen = false;
    }