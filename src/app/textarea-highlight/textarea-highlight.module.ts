import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TextareaHighlightComponent } from "./textarea-highlight.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [TextareaHighlightComponent],
  exports: [TextareaHighlightComponent]
})
export class TextareaHighlightModule {}
