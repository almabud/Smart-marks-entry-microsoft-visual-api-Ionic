import { SharedService } from './../shared/shared.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: any;
  constructor(private _formBuilder: FormBuilder, private sharedService: SharedService, private router: Router) { }

  ngOnInit() {
    this.formInit();
  }

  formInit() {
    this.loginForm = this._formBuilder.group({
      userId: [''],
      password: [''],
    });
  }

  onLogin(){
    let userId = this.loginForm.get('userId').value;
    let password = this.loginForm.get('password').value;
    if(userId == "almabud37@gmail.com" && password == "123456"){
      this.sharedService.login();
      this.router.navigate(["home"]);
    }
  }

}
