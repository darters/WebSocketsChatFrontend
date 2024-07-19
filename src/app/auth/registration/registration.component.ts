import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {UserService} from "../../service/user.service";
import {User} from "../../model/user";
import {Router} from "@angular/router";

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  constructor(private formBuilder: FormBuilder,
              private authService: UserService,
              private router: Router) {
  }

  registerForm: any;
  passwordEye: string = '/assets/img/close-eye.svg'


  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  submitForm() {
    if(this.registerForm.valid) {
      console.log(this.registerForm.value);
      const user: User = {
        username: this.registerForm.get('username').value,
        password: this.registerForm.get('password').value
      }
      this.authService.registration(user)
        .subscribe((result) => console.log(result));
        this.router.navigate(['/login'])
    } else {
      console.log("Something was wrong");
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
}
