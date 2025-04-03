import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-borrow-form',
  templateUrl: './borrow-form.component.html',
  styleUrls: ['./borrow-form.component.css']
})
export class BorrowFormComponent {
  borrowForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.borrowForm = this.fb.group({
      reference: ['', Validators.required],
      marque: ['', Validators.required],
      type: ['', Validators.required],
      etat: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.borrowForm.valid) {
      this.loading = true;
      const formData = this.borrowForm.value;
      this.http.post('/api/borrow', formData).subscribe(
        (response: any) => {
          this.loading = false;
          this.success = true;
          alert('Emprunt enregistré avec succès !');
          this.router.navigate(['/next-step']);
        },
        (error) => {
          this.loading = false;
          this.error = error.error.message || 'Une erreur est survenue lors de l\'enregistrement.';
        }
      );
    } else {
      this.error = 'Veuillez remplir tous les champs correctement.';
    }
  }
}
