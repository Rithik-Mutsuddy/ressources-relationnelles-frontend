import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { Account } from "../../../../core/models/account.model";
import { UserRole } from "../../../../core/models/user.model";
import { SuperAdminService } from "../../../../core/services/super-admin.service";

@Component({
  standalone: true,
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AccountListComponent implements OnInit {

  // STATE
  accounts = signal<Account[]>([]);
  search = '';

  roleFilter = signal<'ALL' | UserRole>('ALL');

  constructor(private service: SuperAdminService) { }

  ngOnInit() {
    this.load();
  }

  // LOAD (API OBJECT -> ARRAY FIX)
  load() {
    this.service.getAccounts().subscribe((res: any) => {

      const list: Account[] =
        Array.isArray(res)
          ? res
          : Object.values(res ?? {});

      this.accounts.set(list);
    });
  }

  // FILTER (SEARCH + ROLE)
  filtered = computed(() => {
    const q = this.search.toLowerCase();

    return this.accounts().filter(a =>
      (
        this.roleFilter() === 'ALL' ||
        a.roles.includes(this.roleFilter() as UserRole)
      ) &&
      (
        a.firstname.toLowerCase().includes(q) ||
        a.lastname.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      )
    );
  });

  // CHANGE ROLE
  changeRole(acc: Account, role: UserRole) {
    this.service.changeRole(acc.id, role).subscribe(() => {
      this.load();
    });
  }

  // DELETE ACCOUNT
  delete(acc: Account) {
    this.service.deleteAccount(acc.id).subscribe(() => {
      this.load();
    });
  }

  // INITIALS AVATAR
  getInitial(a: Account): string {
    return (a.firstname?.[0] ?? '') + (a.lastname?.[0] ?? '');
  }

}