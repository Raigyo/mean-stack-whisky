import { Component, OnInit } from "@angular/core";
import { User } from "../models/user";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.css"],
})
export class AuthComponent implements OnInit {
  user: User = { username: "", password: "", status: "admin" };
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  login() {
    console.log("user", this.user);
    this.authService.login(this.user).subscribe(
      (data) => this.handleSuccess(data),
      (error) => this.handleError(error)
    );
  }

  handleSuccess(data: User) {
    console.log("logged in", data);
    this.router.navigate(["/admin"]);
  }

  handleError(error: any) {
    console.error("NOT logged in", error);
  }
}
