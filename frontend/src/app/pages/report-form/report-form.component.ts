import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.css']
})
export class ReportFormComponent {
  reportForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.reportForm = this.fb.group({
      reference: ['', Validators.required],
      marque: ['', Validators.required],
      type: ['', Validators.required],
      observation: ['']
    });
  }

  onSubmit() {
    if (this.reportForm.valid) {
      this.loading = true;
      const formData = this.reportForm.value;
      this.http.post('/api/report', formData).subscribe(
        (response: any) => {
          this.loading = false;
          this.success = true;
          alert('Signalement enregistré avec succès !');
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
