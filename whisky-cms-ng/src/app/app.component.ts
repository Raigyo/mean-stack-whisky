import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { AuthComponent } from "./auth/auth.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "whisky-cms-ng";

  constructor(
    private authService: AuthService,
    private authComponent: AuthComponent,
    private router: Router
  ) {}

  logout() {
    this.authService.logout().subscribe(
      (data) => {
        // console.log(data);
        sessionStorage.removeItem("currentUser");
        this.router.navigate(["/auth"]);
      },
      (err) => console.error(err)
    );
  }
}
