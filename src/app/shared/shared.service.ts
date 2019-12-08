import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { map, retryWhen, tap, delayWhen, delay, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  islogin = false;

  examData:any = '';
  constructor(private storage: Storage, private http: HttpClient) { }

  setSession(semester, exam, section){
    if(semester){
      this.storage.set('semester', semester);
    }
    if(exam){
      this.storage.set('exam', exam);
    }
    if(section){
      this.storage.set('section', section);
    }
  }

  async getSession(key) {
    try {
      const result = await this.storage.get(key);
      console.log('storageGET: ' + key + ': ' + result);
      if (result != null) {
      return result;
      }
      return null;
      } catch (reason) {
      console.log(reason);
      return null;
      }
  }

  login(){
    this.islogin = true;
    // try {
    //   const result = await this.storage.set('user', data);
    //   console.log('set string in storage: ' + result);
    //   return true;
    //   } catch (reason) {
    //   console.log(reason);
    //   return false;
    //   }
  }

  logOut(){
    this.islogin = false;
  }

  get(apiUrl = environment.apiUrl) {
    return this.http.get(
      apiUrl,
      {
        headers: new HttpHeaders({
          'Ocp-Apim-Subscription-Key': environment.apiKey
        }),
        observe: 'response'
      }
    )
    .pipe(
      map((res: any) => {
        if (res.body.status === 'Running') {
          throw res;
        }
        return res;
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(val => console.log('Running...')),
          delay(2000),
          take(5)
        )
      )
    );
  }

  post(data: any, contentType = 'application/json') {
   // let httpHeaders = new HttpHeaders().set('Authorization', this.UserSessionData.token ? 'Bearer ' + this.UserSessionData.token : '' );
    // if(contentType != '' || contentType){
    //  httpHeaders.set('Content-Type', contentType);
    // }
    return this.http.post(environment.apiUrl, data, { headers: new HttpHeaders({
              'Content-Type': contentType,
              'Ocp-Apim-Subscription-Key': environment.apiKey
            }
          ),
          observe: 'response'
        }
      );
  }
}
