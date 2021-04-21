import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BlogpostListComponent } from "./blogpost-list/blogpost-list.component";
import { BlogpostComponent } from "./blogpost/blogpost.component";
import { ErrorpageComponent } from "./errorpage/errorpage.component";
import { AdminComponent } from "./admin/admin.component";
import { BlogpostEditComponent } from "./blogpost-edit/blogpost-edit.component";

const routes: Routes = [
  { path: "", component: BlogpostListComponent },
  { path: "blog-posts/:id", component: BlogpostComponent },
  { path: "admin", component: AdminComponent },
  { path: "admin/blog-posts/:id", component: BlogpostEditComponent },
  // Catch-all route: has to be in last position
  { path: "**", component: ErrorpageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
