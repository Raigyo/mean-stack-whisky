import { Component, OnInit, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { environment } from "./../../environments/environment";
import { Router } from "@angular/router";
import { AuthService } from "./../services/auth.service";

import { Blogpost } from "../models/blogpost";
import { BlogpostService } from "../services/blogpost.service";

@Component({
  selector: "app-blogpost-edit",
  templateUrl: "./blogpost-edit.component.html",
  styleUrls: ["./blogpost-edit.component.css"],
})
export class BlogpostEditComponent implements OnInit {
  blogpostId!: string;
  imagePath = environment.imagePath;
  blogpost!: Blogpost;
  imagePreview: any = {
    name: "",
  };
  oldImage = "";
  file!: File;
  newImg!: string;
  errorFromServer = "";

  constructor(
    private blogpostService: BlogpostService,
    private el: ElementRef,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.blogpostId = this.activatedRoute.snapshot.paramMap.get("id")!;
    this.blogpostService.getBlogpostById(this.blogpostId).subscribe(
      (data) => {
        this.blogpost = data;
        this.imagePreview.name = this.imagePath + this.blogpost.smallImage;
      },
      (error) => console.error(error)
    );
    this.oldImage = this.imagePreview.name;
  }

  // Onchange: Img preview - todo: put in a helper
  getFiles(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview.name = reader.result);
      reader.readAsDataURL(file);
      this.upload();
    }
  }

  // Upload img to node
  async upload() {
    // retrieve file upload HTML tag
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector(
      "#image"
    );
    let fileCount: number = inputEl.files!.length;
    let formData = new FormData();
    try {
      // make sure a file was selected.
      if (fileCount > 0) {
        formData.append("blogimage", inputEl.files!.item(0)!);
        this.blogpostService.uploadImage(formData).subscribe(
          async (data) => {
            (this.newImg = await data.file.filename),
              console.log("this.newImg upload(): ", this.newImg);
            // OUTPUT ex: d55a75b5d26778b034275cd693812710.png
            return this.newImg;
          },
          (error) => {
            console.error(error);
            const reader = new FileReader();
            reader.onload = (e) => (this.imagePreview.name = this.oldImage);
            this.errorFromServer = `Error: ${error.status} - ${error.statusText}`;
          }
        );
      }
    } catch (error) {
      (error: any) => console.error(error);
      this.errorFromServer = `Error: ${error.status} - ${error.error.msg}`;
    }
  }

  updateBlogpost(formDirective: NgForm) {
    const editedBlogpost = this.blogpost;
    if (this.newImg !== undefined) {
      editedBlogpost["image"] = this.newImg;
    }

    this.blogpostService
      .updateBlogpost(this.blogpostId, editedBlogpost)
      .subscribe(
        (data) => this.handleSuccess(data, formDirective),
        (error) => this.handleError(error)
      );
    console.log("data sent:", editedBlogpost);
  }

  handleSuccess(data: any, formDirective: NgForm) {
    // console.log("OK handleSuccess - blog post updated: ", data);
    console.log("OK handleSuccess - blog post updated: ");
    // todo: replace by modal and redirect to dashboard
    // formDirective.reset();
    // this.imagePreview.name = "";
    // formDirective.resetForm();
    this.blogpostService.dispatchBlogpostCreated(data._id);
  }
  logout() {
    this.authService.logout().subscribe(
      (data) => {
        console.log(data);
        this.router.navigate(["/auth"]);
      },
      (err) => console.error(err)
    );
  }

  handleError(error: { status: number; statusText: any; error: any }) {
    console.log("KO handleError - blog post NOT updated: ", error);
    this.errorFromServer = `Error: ${error.status} - ${error.error.msg}`;
  }
}
