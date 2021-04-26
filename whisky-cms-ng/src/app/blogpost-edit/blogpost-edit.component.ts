import { Component, OnInit, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgForm } from "@angular/forms";
import { environment } from "./../../environments/environment";

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
  oldImg!: string;
  imagePreview: any = {
    name: "",
  };
  files!: FileList;
  newImg!: string;

  constructor(
    private blogpostService: BlogpostService,
    private el: ElementRef,
    private activatedRoute: ActivatedRoute
  ) {}

  // Onchange: Img preview - todo: put in a helper
  getFiles(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview.name = reader.result);
      reader.readAsDataURL(file);
    }
  }

  ngOnInit() {
    this.blogpostId = this.activatedRoute.snapshot.paramMap.get("id")!;
    this.blogpostService.getBlogpostById(this.blogpostId).subscribe(
      (data) => {
        this.blogpost = data;
        this.imagePreview.name = this.imagePath + this.blogpost.smallImage;
      },
      (error) => console.error(error)
    );
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
          (error) => console.error(error)
        );
      }
    } catch (error) {
      (error: any) => console.error(error);
    }
  }

  updateBlogpost(formDirective: NgForm) {
    this.upload()
      .then(() => {
        const editedBlogpost = this.blogpost;
        console.log("this.newImg updateBlogpost(): ", this.newImg);
        // OUTPUT: Undefined
        editedBlogpost["image"] = this.newImg;
        this.blogpostService
          .updateBlogpost(this.blogpostId, editedBlogpost)
          .subscribe(
            (data) => this.handleSuccess(data, formDirective),
            (error) => this.handleError(error)
          );
        console.log("data sent:", editedBlogpost);
      })
      .catch((error) => console.log(error.message));
  }

  handleSuccess(data: any, formDirective: NgForm) {
    console.log("OK handleSuccess - blog post updated: ", data);
    // todo: replace by modal and redirect to dashboard
    formDirective.reset();
    formDirective.resetForm();
    this.blogpostService.dispatchBlogpostCreated(data._id);
  }

  handleError(error: { status: number; statusText: any }) {
    console.log("KO handleError - blog post NOT updated: ", error);
  }
}
