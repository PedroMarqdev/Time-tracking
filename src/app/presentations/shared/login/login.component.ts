import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faUser, faLock, faClock, faSignIn} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import {RouteEnum} from '@core/enums/route.enum';
import {AuthService} from '@services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  currentTime: Date = new Date();
  errorMessage: string = '';

  userIcon = faUser;
  lockIcon = faLock;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const {username, password} = this.loginForm.value;

      if (this.authService.login(username, password)) {
        this.router.navigate([RouteEnum.EMPLOYEE_DASHBOARD]);
      } else {
        this.errorMessage = 'Credenciais inválidas.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    }
  }
}
