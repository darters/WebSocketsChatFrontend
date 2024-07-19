import {Component, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {UserService} from "../../service/user.service";
import {User} from "../../model/user";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  constructor(private formBuilder: FormBuilder,
              private authService: UserService,
              private router: Router) {
  }

  loginForm: any;
  errorMessage: string = '';
  passwordEye: string = '/assets/img/close-eye.svg'
  submitForm() {
    if(this.loginForm.valid) {
      const user: User = {
        username: this.loginForm.get('username').value,
        password: this.loginForm.get('password').value
      }
      if (user.username.trim().length >= 5 && user.password.trim().length >= 6) {
        this.authService.login(user).subscribe((response: any) => {
          sessionStorage.removeItem("token")
          sessionStorage.setItem("token", JSON.parse(response).token)
          this.router.navigate([''])
        }, (error) => {
          if(error.status === 401) {
            this.errorMessage = "Incorrect password or username"
          } else {
            console.log(error)
          }
        });
      }

    } else {
      console.log("Something was wrong")
    }
  }
  togglePassword(passwordInput: HTMLInputElement) {
    if (passwordInput.type !== 'password') {
      passwordInput.type = 'password';
      this.passwordEye = '/assets/img/close-eye.svg'
    } else {
      passwordInput.type = 'text';
      this.passwordEye = '/assets/img/open-eye.svg'
    }
  }

  ngOnInit(): void {
    sessionStorage.removeItem("token")
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }
}
