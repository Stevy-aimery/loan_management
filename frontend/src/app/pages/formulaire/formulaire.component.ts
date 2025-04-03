import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-formulaire',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.css']
})
export class FormulaireComponent implements OnInit {
  registrationForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if user already exists
    const email = this.registrationForm.get('email')?.value;
    if (email) {
      this.checkUserExists(email);
    }
  }

  checkUserExists(email: string): void {
    this.http.get(`/api/users/exists/${email}`).subscribe((response: any) => {
      if (response.exists) {
        this.router.navigate(['/next-step']); // Redirect if user exists
      }
    }, error => {
      console.error('Error checking user existence:', error);
    });
  }

  onRegister(): void {
    if (this.registrationForm.valid) {
      this.loading = true;
      const formData = this.registrationForm.value;
      console.log('Submitting form data:', formData); // Debugging log
      this.http.post('/api/users', formData).subscribe(
        (response: any) => {
          console.log('Response received:', response); // Debugging log
          this.loading = false;
          this.success = true;
          alert('Enregistrement réussi !');
          this.router.navigate(['/next-step']); // Navigate to the next page after registration
        },
        (error) => {
          console.error('Error during registration:', error); // Debugging log
          console.error('Full error response:', error); // Log full error response for debugging
          this.loading = false;
          this.error = error.error.message || 'Une erreur est survenue lors de l\'enregistrement.';
        }
      );
    } else {
      this.error = 'Veuillez remplir tous les champs correctement.';
    }
  }
}