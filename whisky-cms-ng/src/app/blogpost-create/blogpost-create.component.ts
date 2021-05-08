import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, FormGroupDirective } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { v4 as uuid } from "uuid";

import { BlogpostService } from "./../services/blogpost.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-blogpost-create",
  templateUrl: "./blogpost-create.component.html",
  styleUrls: ["./blogpost-create.component.css"],
})
export class BlogpostCreateComponent implements OnInit {
  @ViewChild("takeInput") takeInput: ElementRef | undefined;
  creationForm!: FormGroup;
  imagePreview: any = {
    name: "",
  };
  errorFromServer = "";
  dialogTitleTxt = "";
  dialogMessageLine1Txt = "";
  newImageName = "";

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private blogpostService: BlogpostService,
    private el: ElementRef,
    private router: Router
  ) {}

  // Used from template to manage file preview
  getFiles(event: any): any {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview.name = reader.result);
      reader.readAsDataURL(file);
    } else {
      this.imagePreview.name = "";
    }
  }

  ngOnInit(): any {
    this.createForm();
    // this.newImageName = uuid();
  }

  createForm(): any {
    this.creationForm = this.formBuilder.group({
      title: "",
      subTitle: "",
      content: "",
      image: "",
    });
  }

  createBlogpost(formDirective: FormGroupDirective): any {
    // Upload image to server and wait response for validity
    const inputEl: HTMLInputElement = this.el.nativeElement.querySelector(
      "#image"
    );
    const fileCount: number = inputEl.files!.length;
    const formData = new FormData();
    if (fileCount > 0 && this.creationForm.valid) {
      console.log("add image", this.newImageName);
      // formData.append("blogimage", inputEl.files!.item(0)!, this.newImageName);
      formData.append("blogimage", inputEl.files!.item(0)!);
      this.blogpostService.uploadImage(formData).subscribe(
        // If ok from server, we send all the data
        (data) => {
          if (this.creationForm.valid) {
            console.log("this.creationForm:", this.creationForm);
            this.blogpostService
              .createBlogpost(this.creationForm.value)
              .subscribe(
                (data) => this.handleSuccess(data, formDirective),
                (error) => this.handleError(error)
              );
          }
        },
        // Else we display a msg to user using modal and reset image field
        (error) => {
          this.dialogTitleTxt = "Wrong image format";
          this.dialogMessageLine1Txt =
            "Only .png, .gif, .jpg and .jpeg files under 2MB are allowed!";
          this.displayModal();
          this.creationForm.patchValue({
            image: "",
          });
          console.error(error);
        }
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
        this.router.navigate(["/auth"]);
      }
      if (this.dialogTitleTxt === "Wrong image format") {
        this.imagePreview.name = "";

        this.takeInput!.nativeElement.value = null;
      }
      if (this.dialogTitleTxt === "Success") {
        this.router.navigate(["/admin"]);
      }
    });
  }

  resetForm(): any {
    this.creationForm.reset();
    this.imagePreview.name = "";
    this.takeInput!.nativeElement.value = null;
  }

  handleSuccess(data: any, formDirective: any): any {
    console.log("OK blogpost created", data);
    this.creationForm.reset();
    formDirective.resetForm();
    this.imagePreview.name = "";
    this.blogpostService.dispatchBlogpostCreated(data._id);
    this.dialogTitleTxt = "Success";
    this.dialogMessageLine1Txt = "The article has been created!";
    this.displayModal();
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
