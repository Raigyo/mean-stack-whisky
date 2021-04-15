import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { Blogpost } from "../models/blogpost";

@Injectable({
  providedIn: "root",
})
export class BlogpostService {
  baseUrl = "http://localhost:3000/api/v1/blog-posts";

  // subject = obsevable with next method
  private blogpostCreated = new Subject<String>();

  // Dependancy injection: accessor instance : type
  constructor(private httpClient: HttpClient) {}

  createBlogpost(blogpost: Blogpost) {
    return this.httpClient.post<Blogpost>(this.baseUrl, blogpost);
  }

  dispatchBlogpostCreated(id: string) {
    this.blogpostCreated.next(id);
  }

  handleBlogpostCreated() {
    // blogpostCreated is private so we return subject as observable
    return this.blogpostCreated.asObservable();
  }

  // method that returns an array (typed in schema)
  getBlogposts(): Observable<Blogpost[]> {
    // request that returns an observable with an array
    return this.httpClient.get<Blogpost[]>(`${this.baseUrl}/`);
  }

  getBlogpostById(id: string | null): Observable<Blogpost> {
    return this.httpClient.get<Blogpost>(`${this.baseUrl}/${id}`);
  }

  deleteSingleBlogpost(id: string) {
    return this.httpClient.delete(`${this.baseUrl}/${id}`);
  }

  deleteBlogposts(ids: string[]) {
    const allIds = ids.join(","); // array with ids list "id1,id2,id3"
    return this.httpClient.delete(`${this.baseUrl}/?ids=${allIds}`); // query parameter with all ids
  }
}
