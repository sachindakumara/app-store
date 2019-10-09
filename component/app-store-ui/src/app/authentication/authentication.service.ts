
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../config/api.endpoints';

import { LoginFormData, LoginResponseData, LogoutResponseData, ClientRegParam, RegClientData, TokenGenerationParam, TokenData, ResetPasswordResponseData } from './authentication.models';
import { AppState } from '../app.data.models';
import { Store } from '@ngrx/store';
import { SigUpUserParam, ResetPasswordParam } from './authentication.models';
import { TokenRefreshAction } from './authentication.actions';

@Injectable()
export class AuthenticationService {

    private loginData: LoginResponseData;
    private clientAuthData: RegClientData;
    private tokenData: TokenData;
    private httpBasicClient: HttpClient;
    private tokenTimer;

    constructor(private http: HttpClient, private store: Store<AppState>, handler: HttpBackend) {
        this.store.select((s) => s.authentication.loginData).subscribe((auth) => {
            this.loginData = auth;
        })

        this.store.select((s) => s.authentication.registeredAppData).subscribe((regAppData) => {
            this.clientAuthData = regAppData;
        })

        this.store.select((s) => s.authentication.tokenDetails).subscribe((token) => {
            this.tokenData = token;
        })

        this.httpBasicClient = new HttpClient(handler);
    }

    login(param: LoginFormData): Observable<LoginResponseData> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.http.post(ApiEndpoints.authentication.login, param, httpOptions).pipe(
            map((data: any) =>
                new LoginResponseData(data.error, data.message)
            ));
    }

    logout(): Observable<LogoutResponseData> {

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.http.get(ApiEndpoints.authentication.logout, httpOptions).pipe(
            map((data: any) => new LogoutResponseData(data)));
    }

    signup(param: SigUpUserParam): Observable<LoginResponseData> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic YWRtaW46YWRtaW4='
            })
        };

        return this.http.post(ApiEndpoints.authentication.signup, param, httpOptions).pipe(
            map((data: any) =>
                new LoginResponseData(data.error, data.message)
            ));
    }

    changePassword(param: ResetPasswordParam) {
        const httpOption = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic YWRtaW46YWRtaW4='
            })
        };

        return this.http.post(ApiEndpoints.authentication.changePassword, param, httpOption).pipe(
            map((data: any) =>
                new ResetPasswordResponseData(data.error, data.message)
            ));
    }

    isLoggedIn() {
        return !!this.loginData;
    }

    clientAppRegistration(loginData: LoginFormData) {

        const param: ClientRegParam = new ClientRegParam();
        param.owner = loginData.username;
        param.grantType = 'password refresh_token';
        param.saasApp = true;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic '+ btoa(`${loginData.username}:${loginData.password}`)
            })
        };

        return this.httpBasicClient.post<RegClientData>(ApiEndpoints.authentication.clientRegistration, param, httpOptions
        ).pipe(
            map((data: RegClientData) => this.clientAuthData = data)
        );
    }


    tokenGeneration(loginData) {
        const body = new HttpParams()
        .set('grant_type', 'password')
        .set('scope', 'apim:subscribe')
        .set('username', loginData.username)
        .set('password', loginData.password);
        
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + localStorage.getItem('tkx')
            })
        };
        return this.httpBasicClient.post<TokenData>(ApiEndpoints.authentication.tokenGeneration, body.toString(), httpOptions);
    }

    tokenRefresh() {
        const body = new HttpParams()
        .set('grant_type', 'refresh_token')
        .set('refresh_token', this.tokenData.refresh_token);

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + localStorage.getItem('tkx')
            })
        };
        return this.httpBasicClient.post<TokenData>(ApiEndpoints.authentication.tokenGeneration, body.toString(), httpOptions);
    }

    startTimer(expire) {
        clearTimeout(this.tokenTimer);
        this.tokenTimer = setTimeout(() => {
            this.store.dispatch(TokenRefreshAction());
        },  (expire*1000)-60);
    }

}
