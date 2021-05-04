import { Component, OnInit, ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, FormGroupDirective } from "@angular/forms";
import { BlogpostService } from "./../services/blogpost.service";
// import { AngularEditorConfig } from "@kolkov/angular-editor";

@Component({
  selector: "app-blogpost-create",
  templateUrl: "./blogpost-create.component.html",
  styleUrls: ["./blogpost-create.component.css"],
})
export class BlogpostCreateComponent implements OnInit {
  creationForm!: FormGroup;
  imagePreview: any = {
    name: "",
  };
  constructor(
    private fb: FormBuilder,
    private blogpostService: BlogpostService,
    private el: ElementRef
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
        (error) => console.error(error)
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

  handleSuccess(data: any, formDirective: any) {
    console.log("OK blogpost created", data);
    this.creationForm.reset();
    formDirective.resetForm();
    this.imagePreview.name = "";
    this.blogpostService.dispatchBlogpostCreated(data._id);
  }

  handleError(error: { status: number; statusText: any }) {
    console.error("KO blogpost NOT created", error);
  }
}
