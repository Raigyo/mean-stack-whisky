import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "./../models/user";
import { environment } from "./../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  baseURL = environment.baseUrlAuth;
  isAuthenticated = false;
  constructor(private http: HttpClient) {}

  login(user: User) {
    this.isAuthenticated = true;
    return this.http.post<User>(`${this.baseURL}/login`, user);
  }

  logout() {
    this.isAuthenticated = false;
    return this.http.get(`${this.baseURL}/logout`);
  }
}
