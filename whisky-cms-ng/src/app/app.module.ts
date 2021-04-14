import { MaterialModule } from "./material.module";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BlogpostComponent } from "./blogpost/blogpost.component";
import { BlogpostListComponent } from "./blogpost-list/blogpost-list.component";

@NgModule({
  declarations: [AppComponent, BlogpostComponent, BlogpostListComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
