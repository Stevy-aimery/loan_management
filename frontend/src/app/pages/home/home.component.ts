import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  logoPath = 'assets/logo.png';

  constructor(
    private router: Router
  ) {}

  navigateToScan() {
    this.router.navigate(['/scanner']);
  }
}
