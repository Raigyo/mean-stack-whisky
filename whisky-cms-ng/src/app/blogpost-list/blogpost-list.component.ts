import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { BlogpostService } from "../services/blogpost.service";
import { Blogpost } from "../models/blogpost";

@Component({
  selector: "app-blogpost-list",
  templateUrl: "./blogpost-list.component.html",
  styleUrls: ["./blogpost-list.component.css"],
})
export class BlogpostListComponent implements OnInit {
  // suffix $ = observable
  blogPostList$!: Observable<Blogpost[]>;
  // Dependancies injection
  constructor(private blogpostService: BlogpostService) {}

  // Lifecycle hook
  ngOnInit() {
    this.blogPostList$ = this.blogpostService.getBlogposts();
  }
}
