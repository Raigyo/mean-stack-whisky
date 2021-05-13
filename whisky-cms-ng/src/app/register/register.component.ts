import { Component, OnInit } from "@angular/core";
import { User } from "../models/user";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  user: User = { username: "", password: "", status: "" };
  errorFromServer = "";
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.errorFromServer = "";
  }

  register(loginForm: NgForm) {
    console.log("user", this.user);
    this.authService.register(this.user).subscribe(
      (data) => {
        this.handleSuccess(data);
      },
      (error) => {
        this.handleError(error);
        loginForm.resetForm();
      }
    );
  }

  resetUserForm(loginForm: NgForm) {
    loginForm.resetForm();
  }

  handleSuccess(data: User) {
    console.log("logged in", data.username);
    sessionStorage.setItem("currentUser", this.user.username);
    this.router.navigate(["/admin"]);
  }

  handleError(error: any) {
    console.error("NOT logged in", error);
    this.errorFromServer = `${error.error.msg}`;
  }
}
