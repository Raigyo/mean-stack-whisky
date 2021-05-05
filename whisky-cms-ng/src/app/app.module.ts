import { MaterialModule } from "./material.module";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AngularEditorModule } from "@kolkov/angular-editor";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BlogpostComponent } from "./blogpost/blogpost.component";
import { BlogpostListComponent } from "./blogpost-list/blogpost-list.component";
import { ErrorpageComponent } from "./errorpage/errorpage.component";
import { AdminComponent } from "./admin/admin.component";
import { BlogpostCreateComponent } from "./blogpost-create/blogpost-create.component";
import { BlogpostEditComponent } from "./blogpost-edit/blogpost-edit.component";
import { AuthComponent } from "./auth/auth.component";
import { AddCookieInterceptor } from "./services/add-cookie.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    BlogpostComponent,
    BlogpostListComponent,
    ErrorpageComponent,
    AdminComponent,
    BlogpostCreateComponent,
    BlogpostEditComponent,
    AuthComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    AngularEditorModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AddCookieInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
