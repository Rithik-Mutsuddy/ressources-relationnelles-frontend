import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './super-admin-layout.component.html',
  styleUrl:    './super-admin-layout.component.scss'
})
export class SuperAdminLayoutComponent {
  auth   = inject(AuthService);
  router = inject(Router);

  user = this.auth.currentUser;

  getInitial(): string {
    return this.user()?.firstname?.charAt(0).toUpperCase() ?? '?';
  }

  getRoleLabel(): string {
    const roles = this.user()?.roles ?? [];
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'Super Admin';
    return 'Citizen';
  }

  // Items de navigation — filtrés selon le rôle
  isSuperAdmin = this.auth.isSuperAdmin;
}