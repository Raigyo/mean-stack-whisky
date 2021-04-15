import { BlogpostService } from "./../services/blogpost.service";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormGroupDirective } from "@angular/forms";

@Component({
  selector: "app-blogpost-create",
  templateUrl: "./blogpost-create.component.html",
  styleUrls: ["./blogpost-create.component.css"],
})
export default class BlogpostCreateComponent implements OnInit {
  creationForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private blogpostService: BlogpostService
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.creationForm = this.fb.group({
      title: "",
      subtitle: "",
      content: "",
    });
  }

  createBlogpost(formDirective: FormGroupDirective) {
    if (this.creationForm.valid) {
      console.log("this.creationForm:", this.creationForm);
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
    this.blogpostService.dispatchBlogpostCreated(data._id);
  }

  handleError(error: { status: number; statusText: any }) {
    console.error("KO blogpost NOT created", error);
  }
}
