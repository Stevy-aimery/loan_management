import { Routes } from '@angular/router';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { ScannerComponent } from './pages/scanner/scanner.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'scanner', component: ScannerComponent },
  { path: 'formulaire', component: FormulaireComponent },
  { path: 'formulaire/:id', component: FormulaireComponent },
  { path: 'formulaire/:action', component: FormulaireComponent },
  { path: 'formulaire/:action/:id', component: FormulaireComponent },
  { path: '**', redirectTo: '' }
];
