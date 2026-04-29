import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-citizen-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './citizen-layout.component.html',
  styleUrl: './citizen-layout.component.scss'
})
export class CitizenLayoutComponent {
  auth   = inject(AuthService);
  router = inject(Router);

  user = this.auth.currentUser;

  getInitial(): string {
    return this.user()?.firstname?.charAt(0).toUpperCase() ?? '?';
  }

  getFullName(): string {
    const u = this.user();
    return u ? `${u.firstname} ${u.lastname}` : '';
  }

  getRoleLabel(): string {
    const roles = this.user()?.roles ?? [];
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('ROLE_ADMIN'))       return 'Administrateur';
    if (roles.includes('ROLE_MODERATOR'))   return 'Modérateur';
    return 'Citizen';
  }
}