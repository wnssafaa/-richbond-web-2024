import { Routes } from '@angular/router';
import { UsersComponent } from './component/users/users.component';
import { SuperviseursComponent } from './component/superviseurs/superviseurs.component';
import { MerchendiseurComponent } from './component/merchendiseur/merchendiseur.component';
import { MagasinsComponent } from './component/magasins/magasins.component';
import { ResponsableAnimateurComponent } from './component/responsable-animateur/responsable-animateur.component';
import { AddSupComponent } from './dialogs/add-sup/add-sup.component';
import { AddMerchComponent } from './dialogs/add-merch/add-merch.component';
import { AdduserComponent } from './component/adduser/adduser.component';
import { LoginComponent } from './component/login/login.component';
import { AuthGuard } from './services/auth-guard.service';
import { ConsultantGuard } from './guards/consultant-guard.service';
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
import { GestionStockComponent } from './component/gestion-stock/gestion-stock.component';
import { KpiComponent } from './component/kpi/kpi.component';

export const routes: Routes = [
    {
        path: 'users',
        component:UsersComponent, canActivate: [AuthGuard, ConsultantGuard]
      },          {
        path: 'adduser/:id',
        component:AdduserComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'adduser',
        component:AdduserComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'users/:id',
        component:UsersComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      {
        path: 'superviseur',
        component:SuperviseursComponent, canActivate: [AuthGuard, ConsultantGuard]
      }, {
        path: 'superviseur/:id',
        component:SuperviseursComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'magasins',
        component:MagasinsComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'responsable-animateur',
        component:ResponsableAnimateurComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'responsable-animateur/:id',
        component:ResponsableAnimateurComponent, canActivate: [AuthGuard, ConsultantGuard]
      },{
        path: 'merchendiseur',
        component:MerchendiseurComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'merchendiseur/:id',
        component:MerchendiseurComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'sup',
        component:AddSupComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'sup/:id',
        component:AddSupComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
        
      {
        path: 'AddMerch',
        component:AddMerchComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      {
        path: 'AddMerch/:id',
        component:AddMerchComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
         {
        path: 'AddMerch/:id',
        component:AddMerchComponent, canActivate: [AuthGuard, ConsultantGuard]
      },
      { path: 'Produit',
        component:ProduitComponent, canActivate: [AuthGuard, ConsultantGuard]},
        { path: 'Produit/:id',
          component:ProduitComponent, canActivate: [AuthGuard, ConsultantGuard]},
        { path: 'produit-detail/:id',
          component:ProduitDetailPageComponent, canActivate: [AuthGuard, ConsultantGuard]},
        { path: 'superviseur-detail/:id',
          component:SuperviseurDetailPageComponent, canActivate: [AuthGuard, ConsultantGuard]},
        { path: 'merchendiseur-detail/:id',
          component:MerchendiseurDetailPageComponent, canActivate: [AuthGuard, ConsultantGuard]},
        { path: 'magasin-detail/:id',
          component:MagasinDetailPageComponent, canActivate: [AuthGuard, ConsultantGuard]},
          { path: 'Addmagsin/:id',
            component:AddMagasinComponent, canActivate: [AuthGuard, ConsultantGuard]},
            { path: 'Addmagsin',
              component:AddMagasinComponent, canActivate: [AuthGuard, ConsultantGuard]},
      { path: 'planification',
              component:PlanificationComponent, canActivate: [AuthGuard, ConsultantGuard]},
              { path: 'addplanification',
              component:AddPlanificationComponent, canActivate: [AuthGuard, ConsultantGuard]},
               { path: 'Dashbord',
              component:DachboardComponent, canActivate: [AuthGuard]},
        { path: 'reset-password', component: ResetPasswordComponent },
         { path: 'help', component: HELPComponent, canActivate: [AuthGuard] },
          { path: 'parametre', component: ParametresComponent ,canActivate: [AuthGuard]},
           { path: 'gestion-visites', component: GestionVisitesComponent, canActivate: [AuthGuard] },
           { path: 'visit-detail/:id', component: VisitDetailPageComponent, canActivate: [AuthGuard] },
           { path: 'gestion-stock', component: GestionStockComponent, canActivate: [AuthGuard, ConsultantGuard] },
           { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
           { path: 'login-history', component: LoginHistoryPageComponent, canActivate: [AuthGuard] },
           { path: 'kpi', component: KpiComponent, canActivate: [AuthGuard] },


];
