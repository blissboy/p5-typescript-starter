import * as  p5 from "p5";

import {} from 'webmidi';
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
import * as random from "seedrandom";
import * as _ from "lodash";
import MIDIAccess = WebMidi.MIDIAccess;

const PI_OVER_180: number = Math.PI / 180.0;
const BACKGROUND: number = 0x000000;

console.log(`Random seed = ${random()}`);

export class ColorKeyboard {

    private midi: MIDIAccess = require('webmidi');
    private windowCenterX: number = window.innerWidth / 2;
    private windowCenterY: number = window.innerHeight / 2;

    shapes: {
        points: p5.Vector[],
        color: p5.Color
    }[];

    setup(p: p5): void {
    }

    draw(p: p5): void {
        p.stroke(127,127,127);
        p.rect(0,0,200,200);
        console.log('frots');

    }



}