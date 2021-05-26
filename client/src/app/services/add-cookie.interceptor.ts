import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class AddCookieInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log(
      `AddCookieInterceptor intercepted ${req.url} with method ${req.method}`
    );
    // modified request to send cookie using HttpRequest
    const reqWithCookie: HttpRequest<any> = req.clone({
      withCredentials: true,
    });
    // we send the new request with a header
    return next.handle(reqWithCookie);
  }
}
