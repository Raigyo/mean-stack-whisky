import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, FormGroupDirective } from "@angular/forms";
import { BlogpostService } from "./../services/blogpost.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-blogpost-create",
  templateUrl: "./blogpost-create.component.html",
  styleUrls: ["./blogpost-create.component.css"],
})
export class BlogpostCreateComponent implements OnInit {
  @ViewChild("takeInput")
  myInputVariable: ElementRef | undefined;
  creationForm!: FormGroup;
  imagePreview: any = {
    name: "",
  };
  errorFromServer = "";
  dialogTitleTxt = "";
  dialogMessageLine1Txt = "";

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private blogpostService: BlogpostService,
    private el: ElementRef,
    private router: Router,
    private InputVar: ElementRef
  ) {}

  getFiles(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview.name = reader.result);
      reader.readAsDataURL(file);
      this.upload();
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
        this.myInputVariable!.nativeElement.value = "";
      }
    });
  }

  upload() {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector(
      "#image"
    );
    let fileCount: number = inputEl.files!.length; // !: we confirm it won't be null
    console.log("fileCount:", fileCount);
    let formData = new FormData();
    if (fileCount > 0) {
      //append the key name 'image' with the first file in the element
      // name has to match with the one used in single method on server side
      formData.append("blogimage", inputEl.files!.item(0)!);
      this.blogpostService.uploadImage(formData).subscribe(
        (data) => console.log(data),
        (error) => {
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
    if (this.creationForm.valid) {
      // console.log("this.creationForm:", this.creationForm);
      this.blogpostService.createBlogpost(this.creationForm.value).subscribe(
        (data) => this.handleSuccess(data, formDirective),
        (error) => this.handleError(error)
      );
    }
  }

  resetForm() {
    this.creationForm.reset();
    this.imagePreview.name = "";
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
