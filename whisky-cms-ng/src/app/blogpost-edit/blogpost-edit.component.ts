import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { v4 as uuid } from "uuid";

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
    this.blogpostService.getBlogpostById(this.blogpostId).subscribe(
      (data) => {
        this.blogpost = data;
        this.imagePreview.name = this.imagePath + this.blogpost.smallImage;
        this.oldImage = this.imagePreview.name;
        console.log("this.oldImage:", this.oldImage);
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
    const editedBlogpost = this.blogpost;

    const inputEl: HTMLInputElement = this.el.nativeElement.querySelector(
      "#image"
    );
    const fileCount: number = inputEl.files!.length;
    const formData = new FormData();
    if (fileCount > 0) {
      formData.append("blogimage", inputEl.files!.item(0)!);
    }
    this.blogpostService.uploadImage(formData).subscribe(
      (data) => {
        this.newImageName = data.file.filename;
        if (this.newImageName !== undefined) {
          editedBlogpost["image"] = this.newImageName;
          editedBlogpost["smallImage"] = "small-" + this.newImageName;
        }
        this.blogpostService
          .updateBlogpost(this.blogpostId, editedBlogpost)
          .subscribe(
            (data) => this.handleSuccess(data, formDirective),
            (error) => this.handleError(error)
          );
        console.log("data sent to mongo:", editedBlogpost);
        console.log("data sent to server:", data);
      },
      (error) => {
        // console.error(error);
        this.dialogTitleTxt = "Wrong image format";
        this.dialogMessageLine1Txt =
          "Only .png, .gif, .jpg and .jpeg files under 2MB are allowed!";
        this.displayModal();
        // this.errorFromServer = `Error: ${error.status} - ${error.statusText}`;
      }
    );
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
        this.router.navigate(["/auth"]);
      }
      if (this.dialogTitleTxt === "Wrong image format") {
        this.imagePreview.name = this.oldImage;
        this.takeInput!.nativeElement.value = null;
      }
    });
  }

  handleSuccess(data: any, formDirective: NgForm): any | NgForm {
    // console.log("OK handleSuccess - blog post updated: ", data);
    console.log("OK handleSuccess - blog post updated: ");
    this.blogpostService.dispatchBlogpostCreated(data._id);
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
    this.errorFromServer = `Error: ${error.status} - ${error.error.msg}`;
    if (error.status === 401 || error.status === 500) {
      this.dialogTitleTxt = "You've been disconnected";
      this.dialogMessageLine1Txt = "Please login again";
      this.displayModal();
    }
  }
}
