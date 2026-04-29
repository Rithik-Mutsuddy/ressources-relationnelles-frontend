import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { FranceConnectService } from '../../../core/auth/france-connect.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private fc = inject(FranceConnectService);
  private router = inject(Router);

  user = this.auth.currentUser;
  isAuthenticated = this.auth.isAuthenticated;
  isModerator = this.auth.isModerator;
  isAdmin = this.auth.isAdmin;
  isSuperAdmin = this.auth.isSuperAdmin;

  // Vrai si on est dans une vue backoffice
  isBackoffice = computed(() =>
    this.router.url.startsWith('/moderator') ||
    this.router.url.startsWith('/admin') ||
    this.router.url.startsWith('/superadmin')
  );

  logout() {
    const isFc = this.fc.isFranceConnectUser();
    const refresh = localStorage.getItem('refresh_token') ?? '';
    this.auth.logout();
    if (isFc) this.fc.logout();
  }

  getUserInitial(): string {
    return this.user()?.firstname?.charAt(0).toUpperCase() ?? '?';
  }

  getUserFullName(): string {
    const u = this.user();
    return u ? `${u.firstname} ${u.lastname}` : '';
  }

  navigateToBackoffice() {
    const roles = this.user()?.roles ?? [];
    if (roles.includes('ROLE_SUPER_ADMIN')) this.router.navigate(['/superadmin/accounts']);
    else if (roles.includes('ROLE_ADMIN')) this.router.navigate(['/admin/dashboard']);
    else if (roles.includes('ROLE_MODERATOR')) this.router.navigate(['/moderator/pending']);
  }

  goToCitizen() {
    this.router.navigate(['/citizen']);
  }
}