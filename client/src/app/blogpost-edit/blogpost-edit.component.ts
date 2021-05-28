import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

import { environment } from "./../../environments/environment";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { AuthService } from "./../services/auth.service";
import { Blogpost } from "../models/blogpost";
import { BlogpostService } from "../services/blogpost.service";

@Component({
  selector: "app-blogpost-edit",
  templateUrl: "./blogpost-edit.component.html",
  styleUrls: ["./blogpost-edit.component.css"],
})
export class BlogpostEditComponent implements OnInit {
  @ViewChild("takeInput") takeInput: ElementRef | undefined;
  blogpostId!: string;
  imagePath = environment.imagePath;
  blogpost!: Blogpost;
  imagePreview: any = {
    name: "",
  };

  file!: File;
  errorFromServer = "";
  dialogTitleTxt = "";
  dialogMessageLine1Txt = "";
  newImageName = "";
  oldImage = "";
  loading = false;

  constructor(
    public dialog: MatDialog,
    private blogpostService: BlogpostService,
    private el: ElementRef,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  // tslint:disable-next-line: typedef
  ngOnInit() {
    // tslint:disable-next-line: no-non-null-assertion
    this.blogpostId = this.activatedRoute.snapshot.paramMap.get("id")!;
    this.loading = true;
    this.blogpostService.getBlogpostById(this.blogpostId).subscribe(
      (data) => {
        this.blogpost = data;
        this.imagePreview.name = this.imagePath + this.blogpost.image;
        this.oldImage = this.imagePreview.name;
        this.loading = false;
      },
      (error) => console.error(error)
    );
  }

  getFiles(event: any): any {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview.name = reader.result);
      reader.readAsDataURL(file);
    } else {
      this.imagePreview.name = this.oldImage;
    }
  }

  updateBlogpost(formDirective: NgForm): any {
    this.loading = true;
    const editedBlogpost = this.blogpost;
    console.log("editedBlogpost", editedBlogpost);

    const inputEl: HTMLInputElement =
      this.el.nativeElement.querySelector("#image");
    const fileCount: number = inputEl.files!.length;
    const formData = new FormData();
    console.log(inputEl.files!.item(0));
    if (fileCount > 0) {
      formData.append("blogimage", inputEl.files!.item(0)!);
      this.blogpostService.uploadImage(formData).subscribe(
        (data) => {
          console.log("we are in data");

          this.newImageName = data.file.path;
          console.log("updated image", data.file);
          editedBlogpost["image"] = this.newImageName;
          // editedBlogpost["smallImage"] = "small-" + this.newImageName;
          this.blogpostService
            .updateBlogpost(this.blogpostId, editedBlogpost, this.oldImage)
            .subscribe(
              (data) => this.handleSuccess(data, formDirective),
              (error) => this.handleError(error)
            );
        },
        (error) => {
          console.log("error", error);

          this.dialogTitleTxt = "Wrong image format";
          this.dialogMessageLine1Txt =
            "Only .png, .gif, .jpg and .jpeg files under 2MB are allowed!";
          this.displayModal();
        }
      );
    } else {
      this.blogpostService
        .updateBlogpost(this.blogpostId, editedBlogpost, this.oldImage)
        .subscribe(
          (data) => this.handleSuccess(data, formDirective),
          (error) => this.handleError(error)
        );
    }
  }

  // Modal
  private displayModal(): any {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "26.5rem",
      data: {
        dialogTitle: this.dialogTitleTxt,
        dialogMessageLine1: this.dialogMessageLine1Txt,
        yesButtonText: "OK",
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (this.dialogTitleTxt === "You've been disconnected") {
        sessionStorage.removeItem("currentUser");
        this.router.navigate(["/auth"]);
      }
      if (this.dialogTitleTxt === "Wrong image format") {
        this.imagePreview.name = this.oldImage;
        this.takeInput!.nativeElement.value = null;
      }
      if (this.dialogTitleTxt === "Success") {
        this.router.navigate(["/admin"]);
      }
    });
  }

  handleSuccess(data: any, formDirective: NgForm): any | NgForm {
    this.blogpostService.dispatchBlogpostCreated(data._id);
    this.dialogTitleTxt = "Success";
    this.dialogMessageLine1Txt = "The article has been updated!";
    this.loading = false;
    this.displayModal();
  }

  logout(): any {
    this.authService.logout().subscribe(
      (data) => {
        console.log(data);
        this.router.navigate(["/auth"]);
      },
      (err) => console.error(err)
    );
  }

  handleError(error: {
    status: number;
    statusText: any;
    error: any;
  }): number | any {
    console.error(error.error.msg);
    this.loading = false;
    this.errorFromServer = `Error: ${error.status} - ${error.error.msg}`;
    if (error.status === 401 || error.status === 500) {
      this.dialogTitleTxt = "You've been disconnected";
      this.dialogMessageLine1Txt = "Please login again";
      this.displayModal();
    }
  }
}
