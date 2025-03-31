import {interval, Subscription} from 'rxjs';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';
import { ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faClock, faSignIn } from '@fortawesome/free-solid-svg-icons';
import localePt from '@angular/common/locales/pt';
import {TimeTrackingFormComponent} from '../../shared/time-tracking-form/time-tracking-form.component';
import {LoginComponent} from '../../shared/login/login.component';
import {AuthService} from '@services/auth.service';
import {Router} from '@angular/router';
import {RouteEnum} from '@core/enums/route.enum';

registerLocaleData(localePt);

@Component({
  selector: 'app-time-clock',
  standalone: true,
  templateUrl: './home-page.component.html',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, TimeTrackingFormComponent, LoginComponent]})
export class HomePageComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService, private router: Router) {
  }
  currentTime: Date = new Date();
  clockSubscription?: Subscription;

  login = false;
  clockIcon = faClock;
  signInIcon = faSignIn;

  ngOnInit(): void {
    this.clockSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  ngOnDestroy(): void {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  loginToggle() {
    if(this.authService.isLoggedIn()) {
      this.router.navigate([RouteEnum.EMPLOYEE_DASHBOARD]);
    }
    this.login = !this.login;
  }


}
