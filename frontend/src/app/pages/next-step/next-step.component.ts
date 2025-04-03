import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-next-step',
  templateUrl: './next-step.component.html',
  styleUrls: ['./next-step.component.css']
})
export class NextStepComponent {

  constructor(private router: Router) {}

  onBorrow() {
    this.router.navigate(['/borrow-form']);
  }

  onReturn() {
    this.router.navigate(['/return-form']);
  }

  onReport() {
    this.router.navigate(['/report-form']);
  }
}
