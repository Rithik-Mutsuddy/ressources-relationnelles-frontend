import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl:    './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  auth   = inject(AuthService);
  router = inject(Router);

  user = this.auth.currentUser;

  getInitial(): string {
    return this.user()?.firstname?.charAt(0).toUpperCase() ?? '?';
  }

  getRoleLabel(): string {
    const roles = this.user()?.roles ?? [];
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('ROLE_ADMIN'))       return 'Administrateur';
    if (roles.includes('ROLE_MODERATOR'))   return 'Modérateur';
    return 'Citizen';
  }

  // Items de navigation — filtrés selon le rôle
  isSuperAdmin = this.auth.isSuperAdmin;
  isAdmin      = this.auth.isAdmin;
  isModerator  = this.auth.isModerator;
}