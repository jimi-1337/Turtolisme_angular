import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    ViewChild
  } from "@angular/core";
  import {
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR
  } from "@angular/forms";
import { debounceTime, distinctUntilChanged, filter, fromEvent, map, tap } from "rxjs";
  
  @Component({
    selector: "app-textarea-highlight",
    templateUrl: "./textarea-highlight.component.html",
    styleUrls: ["./textarea-highlight.component.css"],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TextareaHighlightComponent),
        multi: true
      }
    ]
  })
  export class TextareaHighlightComponent
    implements  ControlValueAccessor {
      
    constructor() { }
      
      
    @Output() messageEvent = new EventEmitter<string>();
    @Input() highlightTexts: string[] = [];
    @ViewChild("backdrop") backdrop!: ElementRef<HTMLDivElement>;
    @ViewChild("textarea") textarea!: ElementRef<HTMLTextAreaElement>;
    @ViewChild('someInput') someInput!: ElementRef;

    ngAfterViewInit() {
      fromEvent(this.someInput.nativeElement,'keyup')
      .pipe(
          map((event : any) => event.target.value),
          filter(Boolean),
          debounceTime(1000),
          distinctUntilChanged(),
          tap(
            (text) => {
            this.sendMessage(text)
          }
          )
      )
      .subscribe();
    }
    

    sendMessage(text :string) {
      this.messageEvent.emit(text)
    }
    
    textValue: string = "";
    get highlightedText () {
      return this.applyHighlights(this.textValue)
    }
  
    applyHighlights(text :string) {
      text = text ? text
        .replace(/\n$/g, "\n\n") : '';
      this.highlightTexts.forEach(x => {
        text = text
        .replace(new RegExp(x, 'g'), "<mark>$&</mark>");
      })
      return text;
      
    }
    handleScroll() {
      var scrollTop = this.textarea.nativeElement.scrollTop;
      this.backdrop.nativeElement.scrollTop = scrollTop;
  
      var scrollLeft = this.textarea.nativeElement.scrollLeft;
      this.backdrop.nativeElement.scrollLeft = scrollLeft;
    }
  
    onChanges = ($value: any) => {};
    onTouched = () => {};
  
    writeValue(value: any): void {
      if (value !== undefined) {
        this.textValue = value;
      }
    }
    registerOnChange(fn: any): void {
      this.onChanges = fn;
    }
    registerOnTouched(fn: any): void {
      this.onTouched = fn;
    }
  }
  