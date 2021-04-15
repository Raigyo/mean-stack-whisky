import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { BlogpostService } from "../services/blogpost.service";
import { Blogpost } from "../models/blogpost";
import { Router } from "@angular/router";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  // blogPosts$: Observable<Blogpost[]> | undefined;
  allBlogposts: Blogpost[] | undefined;
  errorFromServer = "";

  constructor(private blogpostService: BlogpostService) {}

  ngOnInit() {
    // this.blogPosts$ = this.blogpostService.getBlogposts();
    this.blogpostService.getBlogposts().subscribe((data) => this.refresh(data));
    this.blogpostService.handleBlogpostCreated().subscribe((data) => {
      console.log("Admin component received", data);
      this.refresh(data);
    });
  }

  deleteBlogposts(selectedOptions: any[]) {
    const ids = selectedOptions.map((so) => so.value);
    if (ids.length === 1) {
      return this.blogpostService.deleteSingleBlogpost(ids[0]).subscribe(
        (data) => this.refresh(data),
        (err) => this.handleError(err)
      );
    } else {
      return this.blogpostService.deleteBlogposts(ids).subscribe(
        (data) => this.refresh(data),
        (err) => this.handleError(err)
      );
    }
  }

  refresh(data: any) {
    console.log("data", data);
    this.blogpostService.getBlogposts().subscribe((data) => {
      this.allBlogposts = data;
    });
  }

  handleError(error: { status: number; statusText: any }) {
    console.error(error);
  }
}
