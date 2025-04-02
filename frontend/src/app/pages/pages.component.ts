import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent {
  
  constructor(private router: Router) {}

  // Simuler un scan de code QR qui redirige vers le formulaire avec un ID d'appareil
  simulerScanQR(): void {
    // Générer un ID aléatoire pour simuler un appareil scanné
    const deviceId = Math.floor(Math.random() * 1000).toString();
    
    // Rediriger vers le formulaire avec l'ID de l'appareil
    this.router.navigate(['/formulaire', deviceId]);
  }
}
