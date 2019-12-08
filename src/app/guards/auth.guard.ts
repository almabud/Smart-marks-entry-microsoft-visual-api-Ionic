import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router, CanLoad, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedService } from '../shared/shared.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(private router: Router, private sharedService: SharedService) {}
  canLoad(route: Route): boolean {
    console.log(this.sharedService.islogin)
    if (!this.sharedService.islogin) {
      this.router.navigate(["login"]);
      return false;
    }

    return true;
  }
  
}
