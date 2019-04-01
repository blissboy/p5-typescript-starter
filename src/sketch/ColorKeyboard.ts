
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
import {WebMidi} from "WebMidi"
import * as random from "seedrandom";
import * as _ from "lodash";
import MIDIAccess = WebMidi.MIDIAccess;
import {p5InstanceExtensions} from "p5";
import p5 = require("p5");

const PI_OVER_180: number = Math.PI / 180.0;
const BACKGROUND: number = 0x000000;

console.log(`Random seed = ${random()}`);

interface Note {
    number: number,
    name: string,
    octave: number
}

interface DrawContext {
    position: p5.Vector
}

export class ColorKeyboard {

    private midi: MIDIAccess = require('webmidi');
    private windowCenterX: number = window.innerWidth / 2;
    private windowCenterY: number = window.innerHeight / 2;

    private p: p5;

    shapes: {
        points: p5.Vector[],
        color: p5.Color
    }[];

    setup(p: p5): void {
        this.p = p;
        this.initMidi();
    }

    draw(p: p5): void {
        p.stroke(127,127,127);
        p.rect(0,0,200,200);
        //console.log('frots');

    }

    private initMidi() : void {
        console.log('initializing midi');

        if (navigator.requestMIDIAccess) {
            console.log('This browser supports WebMIDI!');
        } else {
            console.log('WebMIDI is not supported in this browser.');
        }

        this.midi.enable((err: any) => {
            if (!err) {
                console.log("enabled midi");
                console.log(`inputs: ${this.midi.inputs}`);
                this.midi.inputs.forEach(input => console.log(`Found midi input ${input.name}`));
                this.midi.inputs.forEach(input => {
                    input.addListener('noteon', 'all', this.noteOnHandler);
                    input.addListener('pitchbend', 'all', this.midiHandler);
                    input.addListener('controlchange', 'all', this.midiHandler);
                });
                console.log(`outputs: ${this.midi.outputs}`)
            } else {
                console.log("Could not midi", err);
                throw err;
            }
        });
        console.log('completed initializing midi');
    }

    private noteOnHandler: (MIDIMessageEvent)=>void = (midiEvent: MIDIMessageEvent): void => {

        console.log(`handling ${JSON.stringify(midiEvent)}`);
        // TODO: this needs to write a plane geom as in https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_colors.html
        // https://threejs.org/examples/#webgl_geometry_colors

        this.drawFlakeSphere(midiEvent.note, this.p.createVector(0,0));

        //createSphere(scene, midiEvent.note, noteTexture);
    }

    private midiHandler: (MIDIMessageEvent) => void = (midiEvent: MIDIMessageEvent) => {
        console.log(`midiEvent: ${JSON.stringify(midiEvent, null, "  ")}`);
    }

    private drawFlakeSphere: (Note, DrawContext)=>void = (note: Note, context: DrawContext)=> {

    }



    // private createFlakeSphere: (Note,p5.material.texture  Texture)=>void = (scene: Scene, note: Note, materialTexture: Texture): void => {
    //     console.log(`note: ${note}`);
    //     let flakeSize: number = 512;
    //     let flakeGeom: PlaneBufferGeometry = new PlaneBufferGeometry(flakeSize, flakeSize);
    //     //let flakeGeom: IcosahedronBufferGeometry = new IcosahedronBufferGeometry(flakeSize, 1);
    //     flakeGeom.rotateZ(PI_OVER_180 * _.random(1.0, true));
    //     let flakeMaterial: Material = new MeshPhongMaterial({map: materialTexture, transparent: true, opacity: 0.4, side: DoubleSide});
    //     //let flakeMaterial: Material = new MeshBasicMaterial({map: createShadowTexture(), transparent: true});
    //     flakeMaterial.transparent = true;
    //     flakeMaterial.opacity = 0.7;
    //     let flakeMesh: Mesh = new Mesh(flakeGeom, flakeMaterial);
    //
    //
    //     let posX = getPositionOffsetForNote(note);
    //     console.log(`flake posX = ${posX}`);
    //     flakeMesh.position.x = getPositionOffsetForNote(note);
    //     flakeMesh.position.y = 0;
    //     //mesh.rotation.x = -1.87;
    //     console.log(`adding flake mesh`);
    //     scene.add(flakeMesh);
    //
    //     setTimeout(() => {
    //         //scene.remove(flakeMesh);
    //         //rotateGeometry(flakeGeom, .41);
    //         rotateMesh(flakeMesh, .51, 1 - _.random(1.0, true));
    //     }, 200)
    //
    // }

}