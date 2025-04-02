import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Device {
  _id: string;
  reference: string;
  marque: string;
  type: string;
  qrCode: string;
  imageUrl: string;
  etat: string;
  disponible: boolean;
  dateAcquisition: Date;
  historique: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface LoanData {
  user_id?: string;
  nom?: string;
  prenom?: string;
  email: string;
  telephone?: string;
  motif_emprunt?: string;
  motif_restitution?: string;
  commentaire?: string;
  date_emprunt?: string;
  date_restitution?: string;
  date_restitution_reelle?: string;
  type_action: 'emprunt' | 'restitution' | 'signalement';
  etat_appareil?: 'bon' | 'moyen' | 'mauvais';
  description_signalement?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl = 'http://localhost:5001/api/devices';
  private loanApiUrl = 'http://localhost:5001/api/loans';
  private userApiUrl = 'http://localhost:5001/api/users';

  constructor(private http: HttpClient) { }

  // Récupérer tous les appareils
  getAllDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}`);
  }

  // Récupérer un appareil par son ID
  getDeviceById(id: string): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/${id}`);
  }

  // Enregistrer un emprunt d'appareil
  borrowDevice(id: string, borrowData: LoanData): Observable<any> {
    // Mapper motif_emprunt vers motif_restitution pour maintenir la compatibilité avec le backend
    if (borrowData.motif_emprunt && !borrowData.motif_restitution) {
      borrowData.motif_restitution = borrowData.motif_emprunt;
    }

    return this.http.post<any>(`${this.apiUrl}/${id}/borrow`, borrowData);
  }

  // Enregistrer une restitution d'appareil
  returnDevice(id: string, returnData: LoanData): Observable<any> {
    return this.http.post<any>(`${this.loanApiUrl}/${id}/return`, returnData);
  }

  // Enregistrer un signalement de problème
  reportDeviceIssue(id: string, reportData: LoanData): Observable<any> {
    return this.http.post<any>(`${this.loanApiUrl}/${id}/report`, reportData);
  }

  // Méthode générique pour traiter une action sur un appareil
  processDeviceAction(id: string, actionData: LoanData): Observable<any> {
    switch (actionData.type_action) {
      case 'emprunt':
        return this.borrowDevice(id, actionData);
      case 'restitution':
        return this.returnDevice(id, actionData);
      case 'signalement':
        return this.reportDeviceIssue(id, actionData);
      default:
        // Par défaut, traiter comme un emprunt
        return this.borrowDevice(id, actionData);
    }
  }

  // Récupérer les utilisateurs pour l'autocomplétion
  getUsersForAutocomplete(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApiUrl}`);
  }

  // Rechercher un utilisateur par terme de recherche
  searchUsers(searchTerm: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApiUrl}/search?q=${encodeURIComponent(searchTerm)}`);
  }

  // Récupérer un utilisateur par email
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/email/${encodeURIComponent(email)}`);
  }

  // Récupérer l'historique des emprunts d'un appareil
  getDeviceLoanHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }

  // Récupérer les emprunts en cours
  getCurrentLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.loanApiUrl}/current`);
  }
}
