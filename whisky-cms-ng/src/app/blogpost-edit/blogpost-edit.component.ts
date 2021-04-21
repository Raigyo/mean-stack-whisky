import { Component, OnInit, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, FormGroupDirective } from "@angular/forms";
import { Observable } from "rxjs";

import { Blogpost } from "../models/blogpost";
import { BlogpostService } from "../services/blogpost.service";

@Component({
  selector: "app-blogpost-edit",
  templateUrl: "./blogpost-edit.component.html",
  styleUrls: ["./blogpost-edit.component.css"],
})
export class BlogpostEditComponent implements OnInit {
  editForm!: FormGroup;
  blogpostId!: string;
  blogpost!: Blogpost;

  constructor(
    private fb: FormBuilder,
    private blogpostService: BlogpostService,
    private el: ElementRef,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.blogpostId = this.activatedRoute.snapshot.paramMap.get("id")!;
    this.blogpostService.getBlogpostById(this.blogpostId).subscribe(
      (data) => {
        this.blogpost = data;
        console.log("data: ", data);
      },
      (error) => console.error(error)
    );
    // this.createForm();
  }

  // createForm() {
  //   this.editForm = this.fb.group({
  //     title: "",
  //     subTitle: "",
  //     content: "",
  //     image: "",
  //   });
  // }

  upload() {
    //retrieve file upload HTML tag
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector(
      "#image"
    );
    let fileCount: number = inputEl.files!.length;
    let formData = new FormData();
    // make sure a file was selected.
    if (fileCount > 0) {
      //append the key name 'image' with the first file in the element
      formData.append("blogimage", inputEl.files!.item(0)!);
      this.blogpostService.uploadImage(formData).subscribe(
        (data) => console.log(data),
        (error) => console.error(error)
      );
    }
  }

  updateBlogpost(formDirective: FormGroupDirective) {
    if (this.editForm.valid) {
      console.log("editForm.value", this.editForm.value);
      // this.editForm.controls.image.setValue(this.editForm.controls.image || 'aze');
      this.blogpostService
        .updateBlogpost(this.blogpostId, this.editForm.value)
        .subscribe(
          (data) => this.handleSuccess(data, formDirective),
          (error) => this.handleError(error)
        );
    }
  }

  // updateBlogpost(formDirective: FormGroupDirective) {
  //   console.log(this.blogpost);
  //   const editedBlogpost = this.blogpost;
  //   this.blogpostService
  //     .updateBlogpost(this.blogpostId, editedBlogpost)
  //     .subscribe(
  //       (data) => this.handleSuccess(data, formDirective),
  //       (error) => this.handleError(error)
  //     );
  // }

  handleSuccess(data: any, formDirective: FormGroupDirective) {
    console.log("OK handleSuccess - blog post updated", data);
    formDirective.reset();
    formDirective.resetForm();
    this.blogpostService.dispatchBlogpostCreated(data._id);
  }

  handleError(error: { status: number; statusText: any }) {
    console.log("KO handleError - blog post NOT updated", error);
  }
}
