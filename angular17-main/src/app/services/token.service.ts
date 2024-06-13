import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private apiUrl = environment.api_Url + 'api/v1/usuario/token/';

  constructor(private http: HttpClient) { }

  setToken(token: string) {
    sessionStorage.setItem("token", token);
  }
  
  getToken() {
    return sessionStorage.getItem("token");
  }
  

  getUserLogged(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get<any>(`${this.apiUrl}`+`${token}`, { headers })
      .pipe(
        catchError(error => {
          throw error;
        })
      );
  }

  logout() {
    sessionStorage.removeItem("token");
  }
  


  
}