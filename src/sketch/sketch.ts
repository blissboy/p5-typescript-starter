import {CameraWeb} from "./CameraWeb";
import * as p5 from "p5";

var sketch = (p: p5) => {

    const colorKeyboard: CameraWeb = new CameraWeb();
    const cameraWeb: CameraWeb = new CameraWeb();

    p.preload = () => {

    }
    
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        cameraWeb.setup(p);
    }

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.draw = () => {
        p.background(100);
        cameraWeb.draw(p);
    }
}

var sketchP = new p5(sketch);