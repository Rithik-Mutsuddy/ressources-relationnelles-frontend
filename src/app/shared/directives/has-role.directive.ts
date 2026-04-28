import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/models/user.model';


@Directive({ selector: '[hasRole]', standalone: true })
export class HasRoleDirective {
  private auth = inject(AuthService);
  private tpl  = inject(TemplateRef);
  private vcr  = inject(ViewContainerRef);

  @Input() set hasRole(role: UserRole | UserRole[]) {
    const roles  = Array.isArray(role) ? role : [role];
    const user   = this.auth.currentUser();
    const hasIt  = user?.roles.some(r => roles.includes(r as UserRole)) ?? false;

    this.vcr.clear();
    if (hasIt) this.vcr.createEmbeddedView(this.tpl);
  }
}

// Usage dans le template :
// <button *hasRole="'ROLE_ADMIN'">Supprimer</button>
// <div *hasRole="['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']">Zone admin</div>