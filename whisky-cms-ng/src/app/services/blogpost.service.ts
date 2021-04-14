import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Blogpost } from "../models/blogpost";

@Injectable({
  providedIn: "root",
})
export class BlogpostService {
  baseUrl = "http://localhost:3000/api/v1/";
  // accessor instance : type
  constructor(private httpClient: HttpClient) {}
  // method that returns an array (typed in schema)
  getBlogposts(): Observable<Blogpost[]> {
    // request that returns an observable with an array
    return this.httpClient.get<Blogpost[]>(`${this.baseUrl}/blog-posts`);
  }
}
