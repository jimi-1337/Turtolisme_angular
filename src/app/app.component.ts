import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, fromEvent, map, tap } from 'rxjs';

interface PaintOptions {
  height: number;
  width: number;
  centerX: number;
  centerY: number;
}

interface RGB {
  R: number
  G: number
  B: number
}


interface input {
  command: string
  X?: number
  Y?: number
  Degree?: number
  color?: RGB
  width?:number
  value?:number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements  AfterViewInit {
  title = 'turtolisme';
  textValue:string = "";

  receiveMessage($event :any) {
    console.log($event);
    this.textValue = $event
    this.ids.map((id) => {
      clearTimeout(id);
    })
    if (this.textValue.length == 0) {
      this.context?.clearRect(0, 0, this.var.width, this.var.height)
      this.draw_turtle(this.current_x - (50/2), this.current_y - (50 / 2), this.context);
    }
    else
      this.check()
  }

  highlightTexts = ["forward", "backward", "center"
  , "turnleft", "turnright", "direction"
  , "go", "gox", "penup", "pendown", "penwidth"
  , "pencolor"];

  speed : string = "350"
  rapidPageValue : string | undefined = '';
  Error : string = "";
  Penup : number = 1;
  LineWidth : number = 4;
  rgb : RGB = {R : 10, G : 10, B : 10};
  LastDegree : number = 90;
  LastLineDegree : number = 90;
  ids : number[] = [];

  var = {
    height: 700,
    width: 1000,
    centerX: 1000 / 2 - 50 / 2,
    centerY: 700 / 2 - 50 / 2,
    imageh: 50,
    imagex: 50,
  };

  current_x = 1000 / 2;
  current_y = 700 / 2;
  deriction = {x: 0, y:1};
  data: input[] = [];
  
  canvas : HTMLCanvasElement | null = null;
  context : CanvasRenderingContext2D | null | undefined = null;
  

  @ViewChild('someInput') someInput!: ElementRef;

  ngAfterViewInit() {

  }

  parse_multiple(str: string, obj : input, data : input[]) {
    let splited_str = str.split(' ');
    if (splited_str.length == 2)
    {
      if (!isNaN(Number(splited_str[1]))) {
        if (splited_str[0] == "forward")
        {
          var tmp = Number(splited_str[1]);
          var c = 1;
          if (tmp < 0)
          {
            c = -1;
            tmp = -tmp;
          }
          while (tmp) {
            obj = {
              command: "",
            };
            let to_add = 0;
            if (tmp >= 10) {
              tmp = tmp - 10;
              to_add = 10;
            }
            else {
              to_add = tmp;
              tmp = 0;
            }
            obj.command = "forward";
            obj.value = to_add*c;
            data.push(obj);
          }
        }
        else if (splited_str[0] == "backward")
        {
          var tmp = Number(splited_str[1]);
          var c = 1;
          if (tmp < 0)
          {
            c = -1;
            tmp = -tmp;
          }
          while (tmp) {
            obj = {
              command: "",
            };
            let to_add;
            if (tmp > 10) {
              tmp = tmp - 10;
              to_add = 10;
            }
            else {
              to_add = tmp;
              tmp = 0;
            }
            obj.command = "backward";
            obj.value = to_add*c;
            data.push(obj);
          }
        }
        else if (splited_str[0] == "turnleft")
        {
          obj.command = "turnleft";
          obj.Degree = Number(splited_str[1]);
          data.push(obj);
        }
        else if (splited_str[0] == "turnright")
        {
          obj.command = "turnright";
          obj.Degree = Number(splited_str[1]);
          data.push(obj);
        }
        else if (splited_str[0] == "direction")
        {
          obj.command = "direction";
          obj.Degree = Number(splited_str[1]);
          data.push(obj);
        }
        else if (splited_str[0] == "gox")
        {
          obj.command = "gox";
          obj.X = Number(splited_str[1]);
          data.push(obj);
        }
        else if (splited_str[0] == "goy")
        {
          obj.command = "goy";
          obj.Y = Number(splited_str[1]);
          data.push(obj);
        }
        else if (splited_str[0] == "penwidth")
        {
          obj.command = "penwidth";
          obj.width = Number(splited_str[1]);
          data.push(obj);
        }
        else this.Error = "Command not found";
      }
      else this.Error = "You have to pass a number";
    }
    else if (splited_str.length <= 4) {
      if (splited_str[0] == "go")
      {
        obj.command = "go";
        obj.X = Number(splited_str[1].slice(0, -1));
        obj.Y = Number(splited_str[2]);
        data.push(obj);
      }
      else if (splited_str[0] == "pencolor")
      {
        obj.command = "pencolor";
        obj.color = { R : 0, G: 0, B: 0};
        obj.color.R = Number(splited_str[1].slice(0, -1));
        obj.color.G = Number(splited_str[2].slice(0, -1));
        obj.color.B = Number(splited_str[3]);
        data.push(obj);
      }
      else this.Error = "Command not found";
    }
    else this.Error = "Unexpected number of argumants";
  }

  async check() {
    this.Error = "";
    this.data = [];
    this.current_x = 1000 / 2;
    this.current_y = 700 / 2;
    this.deriction = {x: 0, y:1};
    this.LastDegree = 0;
    this.LastLineDegree = 90;
    this.Penup = 1;
    this.LineWidth = 4;
    this.rgb = {R : 10, G : 10, B : 10};

    var cmd = this.textValue.split('\n');
    for (var i = 0; i < cmd.length; i++) {
      let obj: input = {
        command: "",
      };
      if (cmd[i] == "center")
      {
        obj.command = "center";
        this.data.push(obj);
      }
      else if (cmd[i] == "penup")
      {
        obj.command = "penup";
        this.data.push(obj);
      }
      else if (cmd[i] == "pendown")
      {
        obj.command = "pendown";
        this.data.push(obj);
      }
      else
      {
        this.parse_multiple(cmd[i], obj, this.data);
      }
    }

    if (this.Error.length == 0) {
      if (this.context != undefined) {
        this.context.clearRect(0, 0, 1000, 700);
      }
      console.log(this.data);
      for (let index = 0; index < this.data.length; index++) {
        await this.start_drawing(this.data.slice(0, index + 1));
        this.draw_turtle(this.current_x - (50/2), this.current_y - (50 / 2), this.context);
        await this.delay(Number(this.speed));
        if (index + 1 != this.data.length) {
          this.current_x = 1000 / 2;
          this.current_y = 700 / 2;
          this.deriction = {x: 0, y:1};
          this.LastDegree = 0;
          this.LastLineDegree = 90;
          this.Penup = 1;
          this.LineWidth = 4;
          this.rgb = {R : 10, G : 10, B : 10};
          this.context?.clearRect(0, 0, this.var.width, this.var.height)
        }
      }
    }
  }

  async start_drawing(data : input[]) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].command == "forward") {
        if (data[i].value)
          await this.forward(data[i].value)
      }
      else if (data[i].command == "backward") {
        if (data[i].value)
          this.backward(data[i].value)
      }
      else if (data[i].command == "gox") {
        if (data[i].X != undefined)
          this.goX(data[i].X)
      }
      else if (data[i].command == "goy") {
        if (data[i].Y != undefined)
          this.goY(data[i].Y)
      }
      else if (data[i].command == "go") {
        if (data[i].Y != undefined && data[i].X != undefined)
          this.goXY(data[i].X, data[i].Y);
      }
      else if (data[i].command == "center") {
        this.center();
      }
      else if (data[i].command == "penup") {
        this.penup();
      }
      else if (data[i].command == "pendown") {
        this.pendown();
      }
      else if (data[i].command == "penwidth") {
        this.penwidth(data[i].width);
      }
      else if (data[i].command == "pencolor") {
        this.pencolor(data[i].color);
      }
      else if (data[i].command == "direction") {
        this.direction(data[i].Degree);
      }
      else if (data[i].command == "turnleft") {
        this.turnLeft(data[i].Degree);
      }
      else if (data[i].command == "turnright") {
        this.turnRight(data[i].Degree);
      }
    }
  }
  
  degrees_to_radians(degrees : number)
  {
    var pi = Math.PI;
    return degrees * (pi/180);
  }
  
  direction(degree : number | undefined) {
    if (degree != undefined && this.context)
    {
      this.LastDegree = degree;
      this.LastLineDegree = 90 + degree;
      var radian = this.degrees_to_radians(this.LastLineDegree);
      this.deriction = {x: -Math.cos(radian), y: Math.sin(radian)};
    }
  }

  turnLeft(degree : number | undefined) {
    if (degree != undefined)
    {
      this.LastLineDegree = this.LastLineDegree - degree;
      this.LastDegree -= degree;
      var radian = this.degrees_to_radians(this.LastLineDegree);
      this.deriction = {x: -Math.cos(radian), y: Math.sin(radian)}
    }
  }

  turnRight(degree : number | undefined) {
    if (degree != undefined)
    {
      this.LastLineDegree = this.LastLineDegree + degree;
      this.LastDegree += degree;
      var radian = this.degrees_to_radians(this.LastLineDegree);
      this.deriction = {x: -Math.cos(radian), y: Math.sin(radian)}
    }
  }

  pencolor(obj : RGB | undefined) {
    if (obj != undefined)
      this.rgb = {R: obj.R, G: obj.G, B: obj.B}
  }

  penwidth(width : number | undefined) {
    if (width) {
      this.LineWidth = width;
    }
  }
  penup() {
    this.Penup = 0;
  }

  pendown() {
    this.Penup = 1;
  }

  goX(X : number | undefined) {
    if (X != undefined && this.context != undefined) {
      this.current_x = X;
    }
  }

  goY(Y : number | undefined) {
    if (Y != undefined && this.context != undefined) {
      this.current_y = Y;
    }
  }

  goXY(X : number | undefined, Y : number | undefined) {
    if (Y != undefined && X != undefined && this.context != undefined) {
      this.current_x = X;
      this.current_y = Y;
    }
  }

  center() {
    if (this.context != undefined) {
      this.current_x = this.var.centerX + (50/2);
      this.current_y = this.var.centerY + (50/2);
    }
  }

  async delay(ms: number) {
    return new Promise(resolve => this.ids.push(Number(setTimeout(resolve, ms))));
  }

  async forward(x : number | undefined) {

    // set line stroke and line width
    if (this.context != undefined && x != undefined)
    {
        this.context.strokeStyle = `rgb(
          ${this.rgb.R},
          ${this.rgb.G},
          ${this.rgb.B})`;
        this.context.lineWidth = this.LineWidth;
    
        if (this.Penup == 1) {
          this.context.beginPath();
          this.context.moveTo(this.current_x, this.current_y);
        }
        this.current_y = this.current_y - x*this.deriction.y;
        this.current_x = this.current_x + x*this.deriction.x;
        if (this.Penup == 1) {
          this.context.lineTo(this.current_x, this.current_y);
          this.context.stroke();
        }
    }
  }

  backward (y : number | undefined) {

    // set line stroke and line width
    if (this.context != undefined && y != undefined)
    {
      if (this.Penup == 1) {
          this.context.strokeStyle = `rgb(
            ${this.rgb.R},
            ${this.rgb.G},
            ${this.rgb.B})`;;
          this.context.lineWidth = this.LineWidth;
      
          // draw a red line
          if (this.Penup == 1) {
            this.context.beginPath();
            this.context.moveTo(this.current_x, this.current_y);
          }
          this.current_y = this.current_y + y*this.deriction.y;
          this.current_x = this.current_x - y*this.deriction.x;
          if (this.Penup == 1) {
            this.context.lineTo(this.current_x, this.current_y * 1);
            this.context.stroke();
          }
      }
    }
  }
  ngOnInit() {
    this.canvas = document.getElementById(
      'real-turtle'
    ) as HTMLCanvasElement | null;

    this.context = this.canvas?.getContext('2d');

    this.make_base(this.var.centerX, this.var.centerY, this.context);
  }
  make_base(x: number, y: number, context : CanvasRenderingContext2D | null | undefined) {
    var base_image = new Image();
    base_image.src = '../assets/turtle.svg';
    base_image.onload = function () {
      context?.drawImage(base_image, x, y, 50, 50);
    };
  }
  draw_turtle(x: number, y: number, context : CanvasRenderingContext2D | null | undefined) {
    var base_image = new Image();
    base_image.src = '../assets/turtle.svg';
    var radian = this.degrees_to_radians(this.LastDegree);
    this.context?.translate( this.current_x, this.current_y );
    this.context?.rotate(radian);
    this.context?.translate( -this.current_x, -this.current_y );
    context?.drawImage(base_image, x, y, 50, 50);
    this.context?.translate( this.current_x, this.current_y );
    this.context?.rotate(-radian);
    this.context?.translate( -this.current_x, -this.current_y );
  }
}
