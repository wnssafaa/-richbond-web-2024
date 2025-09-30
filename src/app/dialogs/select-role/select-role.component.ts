import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AddSupComponent } from '../add-sup/add-sup.component';
import { AddMerchComponent } from '../add-merch/add-merch.component';

export interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './select-role.component.html',
  styleUrls: ['./select-role.component.css']
})
export class SelectRoleComponent implements OnInit {
  selectedRole: string = '';
  
  roleOptions: RoleOption[] = [
    {
      value: 'SUPERVISEUR',
      label: 'Superviseur',
      description: 'Gère et supervise les merchandiseurs',
      icon: 'supervisor_account'
    },
    {
      value: 'MERCHANDISEUR',
      label: 'Merchandiseur',
      description: 'Gère les produits et les magasins',
      icon: 'storefront'
    }
  ];

  constructor(
    private dialogRef: MatDialogRef<SelectRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  onRoleSelect(): void {
    if (!this.selectedRole) {
      return;
    }

    // Fermer le dialogue de sélection de rôle
    this.dialogRef.close({ selectedRole: this.selectedRole });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getRoleIcon(roleValue: string): string {
    const role = this.roleOptions.find(r => r.value === roleValue);
    return role ? role.icon : 'person';
  }

  getRoleDescription(roleValue: string): string {
    const role = this.roleOptions.find(r => r.value === roleValue);
    return role ? role.description : '';
  }
}

