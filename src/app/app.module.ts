import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TextareaHighlightModule } from './textarea-highlight/textarea-highlight.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TextareaHighlightModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
