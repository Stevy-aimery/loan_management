import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceService, Device, User, LoanData } from '../../services/device.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-formulaire',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.css'],
  providers: [DeviceService]
})
export class FormulaireComponent implements OnInit {
  deviceId: string = '';
  device: Device | null = null;
  loanForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: boolean = false;
  users: User[] = [];
  filteredUsers: User[] = [];
  showUserDropdown: boolean = false;
  searchTerm: string = '';
  action: 'emprunt' | 'restitution' | 'signalement' = 'emprunt';
  activeTab: 'emprunt' | 'restitution' | 'signalement' = 'emprunt';
  searchUserControl = new FormControl('');
  searchingUsers: boolean = false;
  
  // États de l'appareil pour le signalement
  etatOptions = [
    { value: 'bon', label: 'Bon état' },
    { value: 'moyen', label: 'État moyen' },
    { value: 'mauvais', label: 'Mauvais état' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private deviceService: DeviceService
  ) {
    this.loanForm = this.createFormGroup();
  }

  ngOnInit(): void {
    // Récupérer l'ID de l'appareil et l'action depuis l'URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const action = params.get('action');
      
      if (id && !action) {
        // Format: /formulaire/:id
        this.deviceId = id;
        this.loadDeviceData();
      } else if (action && !id) {
        // Format: /formulaire/:action
        if (action === 'emprunt' || action === 'restitution' || action === 'signalement') {
          this.activeTab = action;
          this.action = action;
          this.loanForm.patchValue({ type_action: action });
          this.loanForm = this.createFormGroup();
        }
      } else if (action && id) {
        // Format: /formulaire/:action/:id
        if (action === 'emprunt' || action === 'restitution' || action === 'signalement') {
          this.activeTab = action;
          this.action = action;
          this.deviceId = id;
          this.loanForm.patchValue({ type_action: action });
          this.loanForm = this.createFormGroup();
          this.loadDeviceData();
        }
      }
    });
    
    // Charger les utilisateurs pour l'autocomplétion
    this.loadUsers();
    
    // Configurer la recherche d'utilisateurs
    this.searchUserControl.valueChanges.subscribe(value => {
      if (value && value.length > 2) {
        this.searchUsers(value);
      } else {
        this.filteredUsers = [];
      }
    });
  }
  
  // Créer le formulaire avec les validateurs appropriés selon l'action
  createFormGroup(): FormGroup {
    // Obtenir les dates par défaut
    const dateEmprunt = this.getCurrentDate();
    const dateRetour = this.getReturnDate();
    
    // Créer un formulaire avec tous les champs possibles
    const formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      type_action: [this.activeTab, Validators.required],
      // Champs pour emprunt
      motif_emprunt: [''],
      date_emprunt: [dateEmprunt],
      date_restitution: [dateRetour],
      // Champs pour restitution
      motif_restitution: [''],
      date_restitution_reelle: [this.getCurrentDate()],
      // Champs pour signalement
      etat_appareil: [''],
      description_signalement: [''],
      // Champ commun
      commentaire: ['']
    });

    // Appliquer les validateurs en fonction de l'onglet actif
    if (this.activeTab === 'emprunt') {
      formGroup.get('motif_emprunt')?.setValidators(Validators.required);
      formGroup.get('date_restitution')?.setValidators(Validators.required);
    } else if (this.activeTab === 'restitution') {
      formGroup.get('motif_restitution')?.setValidators(Validators.required);
    } else if (this.activeTab === 'signalement') {
      formGroup.get('etat_appareil')?.setValidators(Validators.required);
      formGroup.get('description_signalement')?.setValidators(Validators.required);
    }

    return formGroup;
  }

  // Charger les données de l'appareil
  loadDeviceData(): void {
    this.loading = true;
    this.deviceService.getDeviceById(this.deviceId).subscribe({
      next: (device) => {
        this.device = device;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'appareil:', err);
        this.error = 'Impossible de charger les informations de l\'appareil.';
        this.loading = false;
      }
    });
  }

  // Charger les utilisateurs pour l'autocomplétion
  loadUsers(): void {
    this.deviceService.getUsersForAutocomplete().subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    });
  }

  // Rechercher un utilisateur lors de la saisie
  searchUsers(term: string): void {
    this.searchingUsers = true;
    this.deviceService.searchUsers(term).subscribe({
      next: (users: User[]) => {
        this.filteredUsers = users;
        this.showUserDropdown = this.filteredUsers.length > 0;
        this.searchingUsers = false;
      },
      error: (err: any) => {
        console.error('Erreur lors de la recherche d\'utilisateurs:', err);
        this.searchingUsers = false;
      }
    });
  }

  // Sélectionner un utilisateur dans la liste déroulante
  selectUser(user: User): void {
    this.loanForm.patchValue({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone
    });
    this.showUserDropdown = false;
    this.searchTerm = '';
  }

  // Vérifier si l'utilisateur existe déjà
  searchUserByEmail(): void {
    const email = this.loanForm.get('email')?.value;
    if (email && this.loanForm.get('email')?.valid) {
      this.deviceService.getUserByEmail(email).subscribe({
        next: (user: User) => {
          if (user) {
            this.loanForm.patchValue({
              nom: user.nom,
              prenom: user.prenom,
              telephone: user.telephone
            });
          }
        },
        error: (err: any) => {
          console.error('Erreur lors de la recherche de l\'utilisateur:', err);
        }
      });
    }
  }

  // Changer d'onglet
  changeTab(tab: 'emprunt' | 'restitution' | 'signalement'): void {
    this.activeTab = tab;
    this.action = tab;
    this.loanForm.patchValue({ type_action: tab });
    
    // Recréer le formulaire avec les validateurs appropriés
    this.loanForm = this.createFormGroup();
    
    // Conserver les informations de l'utilisateur
    const userData = {
      email: this.loanForm.get('email')?.value,
      nom: this.loanForm.get('nom')?.value,
      prenom: this.loanForm.get('prenom')?.value,
      telephone: this.loanForm.get('telephone')?.value
    };
    
    this.loanForm.patchValue(userData);
  }

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.loanForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loanForm.controls).forEach(key => {
        const control = this.loanForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    const formData = this.loanForm.value;
    
    // Préparer les données selon l'action
    const loanData: LoanData = {
      email: formData.email,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      type_action: this.activeTab
    };
    
    // Ajouter les champs spécifiques selon l'action
    if (this.activeTab === 'emprunt') {
      loanData.motif_emprunt = formData.motif_emprunt;
      loanData.date_restitution = formData.date_restitution;
    } else if (this.activeTab === 'restitution') {
      loanData.motif_restitution = formData.motif_restitution;
    } else if (this.activeTab === 'signalement') {
      loanData.etat_appareil = formData.etat_appareil;
      loanData.description_signalement = formData.description_signalement;
    }
    
    // Ajouter le commentaire s'il existe
    if (formData.commentaire) {
      loanData.commentaire = formData.commentaire;
    }
    
    // Appeler le service approprié selon l'action
    let serviceCall;
    
    if (this.activeTab === 'emprunt') {
      serviceCall = this.deviceService.borrowDevice(this.deviceId, loanData);
    } else if (this.activeTab === 'restitution') {
      serviceCall = this.deviceService.returnDevice(this.deviceId, loanData);
    } else if (this.activeTab === 'signalement') {
      serviceCall = this.deviceService.reportDeviceIssue(this.deviceId, loanData);
    } else {
      this.error = 'Action non reconnue';
      this.loading = false;
      return;
    }
    
    serviceCall.subscribe({
      next: (response: any) => {
        this.success = true;
        this.loading = false;
        this.error = '';
        
        // Réinitialiser le formulaire après 3 secondes
        setTimeout(() => {
          this.resetForm();
        }, 3000);
      },
      error: (err: any) => {
        console.error('Erreur lors de la soumission du formulaire:', err);
        this.error = err.error?.message || 'Une erreur est survenue lors de la soumission du formulaire.';
        this.loading = false;
      }
    });
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.loanForm.reset({ type_action: this.activeTab });
    this.success = false;
    this.error = '';
  }

  // Annuler et retourner à la page d'accueil
  cancel(): void {
    this.router.navigate(['/']);
  }

  // Obtenir le texte de l'action
  getActionText(): string {
    switch(this.activeTab) {
      case 'emprunt': return 'Emprunt';
      case 'restitution': return 'Restitution';
      case 'signalement': return 'Signalement';
      default: return 'Action';
    }
  }

  // Obtenir l'icône de l'action
  getActionIcon(): string {
    switch(this.activeTab) {
      case 'emprunt': return 'bi-box-arrow-in-down';
      case 'restitution': return 'bi-box-arrow-in-up';
      case 'signalement': return 'bi-exclamation-triangle';
      default: return 'bi-qr-code-scan';
    }
  }

  // Obtenir la couleur de l'action
  getActionColor(): string {
    switch(this.activeTab) {
      case 'emprunt': return 'var(--sing-teal)';
      case 'restitution': return 'var(--sing-green)';
      case 'signalement': return 'var(--sing-yellow)';
      default: return 'var(--sing-teal)';
    }
  }

  // Vérifier si un champ est invalide
  isFieldInvalid(fieldName: string): boolean {
    const control = this.loanForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Obtenir le message d'erreur pour un champ
  getErrorMessage(fieldName: string): string {
    const control = this.loanForm.get(fieldName);
    if (!control) return '';
    
    if (control.errors?.['required']) {
      return 'Ce champ est requis';
    }
    
    if (control.errors?.['email']) {
      return 'Veuillez entrer une adresse email valide';
    }
    
    if (control.errors?.['pattern']) {
      if (fieldName === 'telephone') {
        return 'Le numéro de téléphone doit contenir 10 chiffres';
      }
      return 'Format invalide';
    }
    
    return 'Champ invalide';
  }

  // Obtenir la date du jour au format YYYY-MM-DD
  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Obtenir la date de retour (même jour que l'emprunt) au format YYYY-MM-DD
  getReturnDate(): string {
    return this.getCurrentDate(); // Même jour que l'emprunt
  }
}