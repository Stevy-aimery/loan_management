import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-return-form',
  templateUrl: './return-form.component.html',
  styleUrls: ['./return-form.component.css']
})
export class ReturnFormComponent {
  returnForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.returnForm = this.fb.group({
      reference: ['', Validators.required],
      marque: ['', Validators.required],
      type: ['', Validators.required],
      remarque: ['']
    });
  }

  onSubmit() {
    if (this.returnForm.valid) {
      this.loading = true;
      const formData = this.returnForm.value;
      this.http.post('/api/return', formData).subscribe(
        (response: any) => {
          this.loading = false;
          this.success = true;
          alert('Restitution enregistrée avec succès !');
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
