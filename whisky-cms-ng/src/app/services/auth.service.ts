import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "./../models/user";
import { environment } from "./../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  baseURL = environment.baseUrlAuth;
  constructor(private http: HttpClient) {}

  login(user: User) {
    return this.http.post<User>(`${this.baseURL}/login`, user);
  }
}
