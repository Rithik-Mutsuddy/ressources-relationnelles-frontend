import { Component } from '@angular/core';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-account-create',
  templateUrl: './account-create.component.html',
  styleUrls: ['./account-create.component.scss']
})
export class AccountCreateComponent {

  form = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    roles: 'ROLE_USER' as UserRole
  };

  constructor(private service: SuperAdminService) { }

  submit() {

  const payload = {
    firstname: this.form.firstname,
    lastname: this.form.lastname,
    email: this.form.email,
    password: this.form.password,
    role: this.form.roles
  };

  this.service.createAccount(payload).subscribe(() => {
    alert('Compte créé');

    this.form = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      roles: 'ROLE_USER'
    };
  });
}
}