import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

type StatusFilter = 'all' | 'active' | 'banned';

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin-users.component.html',
  styleUrl: './super-admin-users.component.scss'
})
export class SuperAdminUsersComponent implements OnInit {
  private adminSvc = inject(AdminService);

  users = signal<User[]>([]);
  searchQuery = '';
  statusFilter = signal<StatusFilter>('all');
  dropdownOpen = signal(false);
  loading = signal(true);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  readonly STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Tous les comptes' },
    { value: 'active', label: 'Actifs' },
    { value: 'banned', label: 'Bannis' },
  ];

  ngOnInit() {
    this.adminSvc.getUsers().subscribe({
      next: (u: any) => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filtered = computed(() => {

    const q = this.searchQuery.toLowerCase();
    const status = this.statusFilter();

    return this.users().filter(u => {

      const matchSearch =
        !q ||
        u.email.toLowerCase().includes(q) ||
        u.firstname.toLowerCase().includes(q) ||
        u.lastname.toLowerCase().includes(q);

      // verified === true  => BANNI
      // verified === false => ACTIF
      const matchStatus =
        status === 'all'
          ? true
          : status === 'active'
            ? u.verified === false
            : u.verified === true;

      return matchSearch && matchStatus;
    });
  });

  get activeCount() {
    return this.users().filter(
      u => u.verified === false
    ).length;
  }

  get bannedCount() {
    return this.users().filter(
      u => u.verified === true
    ).length;
  }
  get currentStatusLabel(): string {
    return this.STATUS_OPTIONS.find(o => o.value === this.statusFilter())?.label ?? 'Tous les comptes';
  }

  ban(user: User) {
    if (!confirm(`Bannir le compte de ${user.firstname} ${user.lastname} ?\nL'utilisateur ne pourra plus se connecter.`)) return;
    this.adminSvc.banUser(user.id).subscribe(() => {
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, verified: true } : u));
      this.showToast(`${user.firstname} ${user.lastname} a été banni`, 'error');
    });
  }

  unban(user: User) {
    if (!confirm(`Débannir le compte de ${user.firstname} ${user.lastname} ?\nL'utilisateur pourra se connecter à nouveau.`)) return;
    this.adminSvc.unbanUser(user.id).subscribe(() => {
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, verified: false } : u));
      this.showToast(`${user.firstname} ${user.lastname} a été débanni`, 'success');
    });
  }

  delete(user: User) {
    if (!confirm(`Supprimer définitivement le compte de ${user.firstname} ${user.lastname} ?\nCette action est irréversible.`)) return;
    this.adminSvc.deleteUser(user.id).subscribe(() => {
      this.users.update(list => list.filter(u => u.id !== user.id));
      this.showToast('Compte supprimé définitivement', 'success');
    });
  }

  selectStatus(v: StatusFilter) { this.statusFilter.set(v); this.dropdownOpen.set(false); }
  toggleDropdown() { this.dropdownOpen.update(v => !v); }
  closeDropdown() { this.dropdownOpen.set(false); }

  getInitial(u: User): string { return u.firstname?.charAt(0).toUpperCase() ?? '?'; }

  getRoleLabel(roles: string[]): string {
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_MODERATOR')) return 'Modérateur';
    return 'Citoyen';
  }

  getRoleBadgeClass(roles: string[]): string {
    if (roles.includes('ROLE_SUPER_ADMIN')) return 'role--purple';
    if (roles.includes('ROLE_ADMIN')) return 'role--blue';
    if (roles.includes('ROLE_MODERATOR')) return 'role--orange';
    return 'role--gray';
  }

  private showToast(msg: string, type: 'success' | 'error') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }
}