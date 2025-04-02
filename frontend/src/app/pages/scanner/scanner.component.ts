import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { DeviceService } from '../../services/device.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, HttpClientModule],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
  providers: [DeviceService]
})
export class ScannerComponent implements OnInit, OnDestroy {
  @ViewChild('scanner') scanner: any;
  
  // Configuration du scanner
  allowedFormats = [BarcodeFormat.QR_CODE];
  scannerEnabled = true;
  torchEnabled = false;
  
  // États du scanner
  loading = false;
  scanError: string | null = null;
  deviceId: string | null = null;
  
  // Action en cours (emprunt, restitution, signalement)
  action: 'emprunt' | 'restitution' | 'signalement' = 'emprunt';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    // Récupérer l'action depuis les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      if (params['action'] && ['emprunt', 'restitution', 'signalement'].includes(params['action'])) {
        this.action = params['action'] as 'emprunt' | 'restitution' | 'signalement';
      }
    });
  }

  ngOnDestroy(): void {
    // Désactiver le scanner lors de la destruction du composant
    this.scannerEnabled = false;
  }

  // Gestionnaire de succès du scan
  onScanSuccess(result: string): void {
    if (this.loading || this.deviceId) return;
    
    this.scannerEnabled = false;
    this.loading = true;
    
    // Extraire l'ID du QR code (le résultat peut être une URL ou directement un ID)
    let deviceId = result;
    
    // Si le résultat est une URL, extraire l'ID
    if (result.includes('/')) {
      const parts = result.split('/');
      deviceId = parts[parts.length - 1];
    }
    
    this.deviceId = deviceId;
    
    // Vérifier si l'appareil existe
    this.deviceService.getDeviceById(deviceId).subscribe({
      next: (device) => {
        // Rediriger vers le formulaire avec l'ID de l'appareil
        this.router.navigate(['/formulaire', deviceId]);
      },
      error: (err) => {
        console.error('Erreur lors de la vérification de l\'appareil:', err);
        this.scanError = 'Appareil non trouvé ou QR code invalide.';
        this.loading = false;
      }
    });
  }

  // Gestionnaire d'erreur du scan
  onScanError(error: any): void {
    console.error('Erreur de scan:', error);
    this.scanError = 'Une erreur est survenue lors du scan.';
  }

  // Gestionnaire d'échec du scan
  onScanFailure(error: any): void {
    // Ne rien faire, c'est normal que le scan échoue quand aucun QR code n'est détecté
  }

  // Réinitialiser le scanner
  resetScan(): void {
    this.scannerEnabled = true;
    this.scanError = null;
    this.deviceId = null;
    this.loading = false;
  }

  // Activer/désactiver la lampe torche
  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
    if (this.scanner) {
      this.scanner.torch = this.torchEnabled;
    }
  }

  // Retourner à la page d'accueil
  goHome(): void {
    this.router.navigate(['/']);
  }
}
