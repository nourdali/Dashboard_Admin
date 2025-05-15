import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelCreationComponent } from './component/model-creation/model-creation.component';
import { ModelListComponent } from './component/model-list/model-list.component';
import { ModelDetailComponent } from './component/model-detail/model-detail.component';

const routes: Routes = [
  { path: 'models', component: ModelListComponent },
  { path: 'models/create', component: ModelCreationComponent },
  { path: 'models/:id', component: ModelDetailComponent },
  { path: '', redirectTo: '/models', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
