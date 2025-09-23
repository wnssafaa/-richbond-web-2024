import { Routes } from '@angular/router';
import { UsersComponent } from './component/users/users.component';
import { SuperviseursComponent } from './component/superviseurs/superviseurs.component';
import { MerchendiseurComponent } from './component/merchendiseur/merchendiseur.component';
import { MagasinsComponent } from './component/magasins/magasins.component';
import { AddSupComponent } from './dialogs/add-sup/add-sup.component';
import { AddMerchComponent } from './dialogs/add-merch/add-merch.component';
import { AdduserComponent } from './component/adduser/adduser.component';
import { LoginComponent } from './component/login/login.component';
import { AuthGuard } from './services/auth-guard.service';
import { ProduitComponent } from './component/produit/produit.component';
import { AddMagasinComponent } from './dialogs/add-magasin/add-magasin.component';
import { PlanificationComponent } from './component/planification/planification.component';
import { DachboardComponent } from './component/dachboard/dachboard.component';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { HELPComponent } from './component/help/help.component';
import { ParametresComponent } from './component/parametres/parametres.component';
import { ProfilComponent } from './component/profil/profil.component';
import { ProduitDetailPageComponent } from './component/produit-detail-page/produit-detail-page.component';
import { SuperviseurDetailPageComponent } from './component/superviseur-detail-page/superviseur-detail-page.component';
import { MerchendiseurDetailPageComponent } from './component/merchendiseur-detail-page/merchendiseur-detail-page.component';
import { MagasinDetailPageComponent } from './component/magasin-detail-page/magasin-detail-page.component';

import { AddPlanificationComponent } from './dialogs/add-planification/add-planification.component';
import { GestionVisitesComponent } from './component/gestion-visites/gestion-visites.component';
import { VisitDetailPageComponent } from './component/visit-detail-page/visit-detail-page.component';
import { LoginHistoryPageComponent } from './component/login-history-page/login-history-page.component';

export const routes: Routes = [
    {
        path: 'users',
        component:UsersComponent, canActivate: [AuthGuard]
      },    {
        path: 'adduser/:id',
        component:AdduserComponent, canActivate: [AuthGuard]
      },
      {
        path: 'adduser',
        component:AdduserComponent, canActivate: [AuthGuard]
      },
      {
        path: 'users/:id',
        component:UsersComponent, canActivate: [AuthGuard]
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      {
        path: 'superviseur',
        component:SuperviseursComponent, canActivate: [AuthGuard]
      }, {
        path: 'superviseur/:id',
        component:SuperviseursComponent, canActivate: [AuthGuard]
      },
      {
        path: 'magasins',
        component:MagasinsComponent, canActivate: [AuthGuard]
      },{
        path: 'merchendiseur',
        component:MerchendiseurComponent, canActivate: [AuthGuard]
      },
      {
        path: 'merchendiseur/:id',
        component:MerchendiseurComponent, canActivate: [AuthGuard]
      },
      {
        path: 'sup',
        component:AddSupComponent, canActivate: [AuthGuard]
      },
      {
        path: 'sup/:id',
        component:AddSupComponent, canActivate: [AuthGuard]
      },
        
      {
        path: 'AddMerch',
        component:AddMerchComponent, canActivate: [AuthGuard]
      },
      {
        path: 'AddMerch/:id',
        component:AddMerchComponent, canActivate: [AuthGuard]
      },
         {
        path: 'AddMerch/:id',
        component:AddMerchComponent, canActivate: [AuthGuard]
      },
      { path: 'Produit',
        component:ProduitComponent, canActivate: [AuthGuard]},
        { path: 'Produit/:id',
          component:ProduitComponent, canActivate: [AuthGuard]},
        { path: 'produit-detail/:id',
          component:ProduitDetailPageComponent, canActivate: [AuthGuard]},
        { path: 'superviseur-detail/:id',
          component:SuperviseurDetailPageComponent, canActivate: [AuthGuard]},
        { path: 'merchendiseur-detail/:id',
          component:MerchendiseurDetailPageComponent, canActivate: [AuthGuard]},
        { path: 'magasin-detail/:id',
          component:MagasinDetailPageComponent, canActivate: [AuthGuard]},
          { path: 'Addmagsin/:id',
            component:AddMagasinComponent, canActivate: [AuthGuard]},
            { path: 'Addmagsin',
              component:AddMagasinComponent, canActivate: [AuthGuard]},
      { path: 'planification',
              component:PlanificationComponent, canActivate: [AuthGuard]},
              { path: 'addplanification',
              component:AddPlanificationComponent, canActivate: [AuthGuard]},
               { path: 'Dashbord',
              component:DachboardComponent, canActivate: [AuthGuard]},
        { path: 'reset-password', component: ResetPasswordComponent },
         { path: 'help', component: HELPComponent, canActivate: [AuthGuard] },
          { path: 'parametre', component: ParametresComponent ,canActivate: [AuthGuard]},
           { path: 'gestion-visites', component: GestionVisitesComponent, canActivate: [AuthGuard] },
           { path: 'visit-detail/:id', component: VisitDetailPageComponent, canActivate: [AuthGuard] },
           { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
           { path: 'login-history', component: LoginHistoryPageComponent, canActivate: [AuthGuard] },


];
