import {ColorKeyboard} from "./ColorKeyboard";
import * as p5 from "p5";

var sketch = (p: p5) => {

    const colorKeyboard: ColorKeyboard = new ColorKeyboard();

    p.preload = () => {

    }
    
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        colorKeyboard.setup(p);
    }

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.draw = () => {
        p.background(100);
        colorKeyboard.draw(p);
    }
}

var sketchP = new p5(sketch);