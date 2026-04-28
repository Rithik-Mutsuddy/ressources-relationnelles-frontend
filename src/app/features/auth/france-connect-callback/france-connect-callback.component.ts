import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { FranceConnectService } from '../../../core/auth/france-connect.service';


@Component({
  selector: 'app-france-connect-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      @if (loading) {
        <p>Connexion via FranceConnect en cours...</p>
      }
      @if (error) {
        <p class="error">{{ error }}</p>
        <button (click)="goToLogin()">Retour à la connexion</button>
      }
    </div>
  `
})
export class FranceConnectCallbackComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private fc      = inject(FranceConnectService);
  private auth    = inject(AuthService);

  loading = true;
  error: string | null = null;

  ngOnInit() {
    const code  = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');

    if (!code || !state) {
      this.error   = 'Paramètres de callback manquants.';
      this.loading = false;
      return;
    }

    this.fc.handleCallback(code, state).subscribe({
      next: (res) => {
        // Met à jour le signal auth global
        this.auth.currentUser.set(res.user);

        // Redirige vers le dashboard citoyen
        this.router.navigate(['/citizen/dashboard']);
      },
      error: (err) => {
        this.error   = err?.error?.error ?? 'Échec de la connexion FranceConnect.';
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}