import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { BlogpostService } from "../services/blogpost.service";
import { Blogpost } from "../models/blogpost";
import { environment } from "./../../environments/environment";

@Component({
  selector: "app-blogpost",
  templateUrl: "./blogpost.component.html",
  styleUrls: ["./blogpost.component.css"],
})
export class BlogpostComponent implements OnInit {
  blogPost$!: Observable<Blogpost>;
  imagePath = environment.imagePath;

  constructor(
    private activatedRoute: ActivatedRoute,
    private blogpostService: BlogpostService
  ) {}

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get("id");
    this.blogPost$ = this.blogpostService.getBlogpostById(id);
  }
}
