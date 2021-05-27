import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { BlogpostService } from "../services/blogpost.service";
import { Blogpost } from "../models/blogpost";
import { Router } from "@angular/router";
import { AuthService } from "./../services/auth.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  // blogPosts$: Observable<Blogpost[]> | undefined;
  allBlogposts: Blogpost[] | undefined;
  errorFromServer = "";
  ngFormRef: any;
  currentUser = sessionStorage.getItem("currentUser");
  loading!: boolean;

  constructor(
    public dialog: MatDialog,
    private blogpostService: BlogpostService,
    private authService: AuthService,
    private router: Router
  ) {
    setTimeout(() => {
      this.loading = true;
    }, 5000);
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(["/auth"]);
    }
    this.blogpostService
      .getBlogpostsAdminPage()
      .subscribe((data) => this.refresh(data));
    this.blogpostService.handleBlogpostCreated().subscribe((data) => {
      // console.log("Admin component received", data);
      this.refresh(data);
    });
  }

  // Modal
  private displayModal() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "26.5rem",
      data: {
        dialogTitle: "You've been disconnected",
        dialogMessageLine1: "Please login again",
        // dialogMessageLine2: "Are you sure you want to leave the page?",
        yesButtonText: "OK",
        // noButtonText: "Stay on this Page",
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      sessionStorage.removeItem("currentUser");
      this.router.navigate(["/auth"]);
    });
  }

  deleteBlogposts(selectedOptions: any[]) {
    const ids = selectedOptions.map((so) => so.value);
    if (ids.length === 1) {
      return this.blogpostService.deleteSingleBlogpost(ids[0]).subscribe(
        (data) => this.refresh(data),
        (err) => this.handleError(err)
      );
    } else {
      return this.blogpostService.deleteBlogposts(ids).subscribe(
        (data) => this.refresh(data),
        (err) => this.handleError(err)
      );
    }
  }

  refresh(data: any) {
    // console.log("data", data);
    this.blogpostService.getBlogpostsAdminPage().subscribe((data) => {
      this.allBlogposts = data;
    });
  }

  handleError(error: { status: number; statusText: any; error: any }) {
    console.error(error.error.msg);
    this.errorFromServer = `Error: ${error.status} - ${error.error.msg}`;
    if (error.status === 401) this.displayModal();
  }

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
