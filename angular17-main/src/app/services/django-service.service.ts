import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DjangoService {

  private apiUrl = environment.api_Url + 'api/v1/registrar/usuario';
  constructor(private http: HttpClient) { }

  registrar(dataSignUp: any): Observable<any>{ 
    return this.http.post<any>(this.apiUrl, dataSignUp)
      .pipe(
        catchError(error => {
          throw error;
        })
      );
  }

  checkUsername(username: string): Observable<any> {
    return this.http.post<any>(`${environment.api_Url}api/v1/check-username`, { username });
  }

  checkEmail(email: string): Observable<any> {
    return this.http.post<any>(`${environment.api_Url}api/v1/check-email`, { email });
  }


  


}
