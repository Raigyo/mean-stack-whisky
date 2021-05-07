import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  NgForm,
} from "@angular/forms";
import { BlogpostService } from "./../services/blogpost.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { Router } from "@angular/router";
import { v4 as uuid } from "uuid";

@Component({
  selector: "app-blogpost-create",
  templateUrl: "./blogpost-create.component.html",
  styleUrls: ["./blogpost-create.component.css"],
})
export class BlogpostCreateComponent implements OnInit {
  @ViewChild("takeInput") takeInput: ElementRef | undefined;
  @ViewChild(NgForm) form: any;
  creationForm!: FormGroup;
  imagePreview: any = {
    name: "",
  };
  errorFromServer = "";
  dialogTitleTxt = "";
  dialogMessageLine1Txt = "";
  newImageName = "";
  validToSendToServer: boolean = false;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private blogpostService: BlogpostService,
    private el: ElementRef,
    private router: Router
  ) {}

  getFiles(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview.name = reader.result);
      reader.readAsDataURL(file);
      // this.upload();
    }
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.creationForm = this.fb.group({
      title: "",
      subTitle: "",
      content: "",
      image: "",
    });
  }

  upload() {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector(
      "#image"
    );
    let fileCount: number = inputEl.files!.length; // !: we confirm it won't be null
    let formData = new FormData();
    if (fileCount > 0) {
      formData.append("blogimage", inputEl.files!.item(0)!, this.newImageName);
      this.blogpostService.uploadImage(formData).subscribe(
        (data) => {
          this.validToSendToServer = true;
          console.log(data);
        },
        (error) => {
          this.validToSendToServer = false;
          this.dialogTitleTxt = "Wrong image format";
          this.dialogMessageLine1Txt =
            "Only .png, .gif, .jpg and .jpeg files under 2MB are allowed!";
          this.displayModal();
          console.error(error);
        }
      );
    }
  }

  createBlogpost(formDirective: FormGroupDirective) {
    this.newImageName = uuid();
    this.upload();

    if (this.creationForm.valid && this.validToSendToServer) {
      console.log("this.creationForm:", this.creationForm);
      this.blogpostService.createBlogpost(this.creationForm.value).subscribe(
        (data) => this.handleSuccess(data, formDirective),
        (error) => this.handleError(error)
      );
    }
  }

  // Modal
  private displayModal() {
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
    });
  }

  resetForm() {
    this.creationForm.reset();
    this.imagePreview.name = "";
    this.takeInput!.nativeElement.value = null;
  }

  handleSuccess(data: any, formDirective: any) {
    console.log("OK blogpost created", data);
    this.creationForm.reset();
    formDirective.resetForm();
    this.imagePreview.name = "";
    this.blogpostService.dispatchBlogpostCreated(data._id);
  }

  handleError(error: { status: number; statusText: any; error: any }) {
    console.error(error.error.msg);
    this.errorFromServer = `Error: ${error.status} - ${error.error.msg}`;
    if (error.status === 401 || error.status === 500) {
      this.dialogTitleTxt = "You've been disconnected";
      this.dialogMessageLine1Txt = "Please login again";
      this.displayModal();
    }
  }
}
