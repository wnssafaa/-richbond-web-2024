import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisablePermissionDirective } from './disable-permission.directive';
import { PermissionDirective } from './permission.directive';

@NgModule({
  declarations: [
    DisablePermissionDirective,
    PermissionDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DisablePermissionDirective,
    PermissionDirective
  ]
})
export class PermissionDirectivesModule { }













