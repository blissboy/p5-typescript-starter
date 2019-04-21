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


interface SnowFlake {
    context: FlakeContext,
    flakePoints: p5.Vector[]
}

interface FlakeContext {
    position: (frame: number) => p5.Vector,
    orientation: (frame: number) => number,
    melted: (frame: number) => boolean
}


interface DrawContext {
    position: p5.Vector
}

interface Flake {
    sections: number,               // each flake is symetrical, how many sections shall we divide a circle into?
    divisionsPerSection: number,    // per section, how many points?
    centerDeltas: number[],         // from the center, what are the deltas for the points in the "reference" section
    draw: (number, Flake) => void,         // drawing function, argument is framenumber. This method should also update melted
    uniqueness: FlakePersonalization,
    melted: boolean,                // true if the flake has reached its end
}

interface FlakePersonalization {
    startingLocation: p5.Vector
}

export class ColorKeyboard {

    private midi: MIDIAccess = require('webmidi');
    private flakes: SnowFlake[] = [];
    private windowCenterX: number = window.innerWidth / 2;
    private windowCenterY: number = window.innerHeight / 2;
    private octaveSize: number = this.windowCenterX;
    private noteSize: number = this.octaveSize / 6;
    private middleCOctave: number = 4;

    private frameNumber: number = 0;


    private p: p5;

    shapes: {
        points: p5.Vector[],
        color: p5.Color
    }[];

    setup(p: p5): void {
        this.p = p;

        p.colorMode(p.HSB, 360, p.width, p.height);
        p.background(360, 0, p.height);


        this.initMidi();
    }

    draw(p: p5): void {

        this.frameNumber++;
        this.drawFlakes(this.flakes);
        this.flakes = this.flakes.filter(flake => !flake.context.melted(this.frameNumber));
        // p.stroke(127, 127, 127);
        // p.rect(0, 0, 200, 200);
        //console.log('frots');

    }

    drawFlakes(flakes: SnowFlake[]) {
        this.flakes.forEach((flake) => {
            //this.drawFlake(flake);
            this.drawFlakeGeneKogan(flake);
        });
    }

    private drawFlake(flake: SnowFlake): void {
        this.p.push();
        this.p.translate(flake.context.position(this.frameNumber));

        this.p.beginShape(this.p.TRIANGLE_FAN);
        this.p.vertex(0, 0);
        flake.flakePoints.forEach((point) => {
            this.p.vertex(point.x, point.y);
            this.p.fill(100, this.p.mouseX, this.p.mouseY);
            this.p.endShape();
        });
        // for (let angle = 0; angle <= 360; angle += angleStep) {
        //     this.p.vertex(width / 2 + cos(radians(angle)) * radius, height / 2 + sin(radians(angle)) * radius);
        //     fill(angle, mouseX, mouseY);
        //
        //     endShape();
        // }
        this.p.pop();

    }


    private drawFlakeGeneKogan(flake: SnowFlake) {
        //background(240);

        const ang1 = this.p.TWO_PI * this.p.noise(0.01 * this.p.frameCount + 10);
        const ang2 = this.p.TWO_PI * this.p.noise(0.01 * this.p.frameCount + 20);
        const ang3 = this.p.TWO_PI * this.p.noise(0.01 * this.p.frameCount + 30);
        const rx = 60 * this.p.noise(0.01 * this.p.frameCount + 40);
        const tx = 200 * this.p.noise(0.01 * this.p.frameCount + 50);
        const size1 = 200 * this.p.noise(0.01 * this.p.frameCount + 60);
        const size2 = 50 * this.p.noise(0.01 * this.p.frameCount + 60);

        this.p.translate(flake.context.position(this.frameNumber));
        // translate(width / 2, height / 2);
        for (let i = 0; i < 17; i++) {
            this.p.push();
            this.p.rotate(ang1 + this.p.TWO_PI * i / 17);
            this.p.translate(tx, 0);
            this.p.rect(0, 0, size1, size1);
            for (let j = 0; j < 16; j++) {
                this.p.push();
                this.p.rotate(ang2 + this.p.TWO_PI * j / 16);
                this.p.translate(rx, 0);
                this.p.rotate(ang3);
                this.p.rect(rx, 0, size2, size2);
                this.p.pop();
            }
            //this.p.translate();
            this.p.pop();
        }
    }


    private createSnowFlake(note: Note): SnowFlake {

        const currentFrame: number = this.frameNumber;
        const framesToLive = 200;

        let positionFn: (number) => p5.Vector = (frame: number) => {
            let location: p5.Vector = new p5.Vector();
            location.x = this.getPositionOffsetForNote(note);
            location.y = 300 + frame - currentFrame;
            return location;
        }

        let orientationFn: (number) => number = (frame: number) => {
            return 0;
        }

        let meltedFn: (number) => boolean = (frame: number) => {
            //console.log(`frame:${frame} currentFrame:${currentFrame} framesToLive:${framesToLive}`);

            return (frame > currentFrame + framesToLive);
        }

        let context: FlakeContext = {
            position: positionFn,
            orientation: orientationFn,
            melted: meltedFn
        };

        return {
            context: context,
            flakePoints: this.generateNewSnowflakePoints(3, 17, 300)
        };
    }


    private generateNewSnowflakePoints(numSectors: number, pointsPerSector: number, maxSize: number): p5.Vector[] {
        const alpha: number = 2 * Math.PI / numSectors;
        const totalFlakePoints: number = (pointsPerSector - 1) * numSectors;

        const flakePoints: p5.Vector[] = new Array(totalFlakePoints);
        const randomVals: number[] = new Array(pointsPerSector - 1);
        for (let i = 0; i < pointsPerSector - 1; i++) {
            randomVals[i] = _.random(1.0, true)
        }


        for (let i: number = 0; i <= totalFlakePoints; i++) {
            flakePoints[i] =
                this.newP5Vector(
                    Math.cos(i * alpha / (pointsPerSector - 1)),
                    Math.sin(i * alpha / (pointsPerSector - 1))
                ).setMag(maxSize * randomVals[i % randomVals.length]);
        }

        //
        //console.log('Flake points:\n');
        //flakePoints.forEach(point => console.log(`\tx:${point.x}, y:${point.y}`));


        return flakePoints;
    }


    // private createFlake(note: Note) {
    //     let location: p5.Vector = new p5.Vector();
    //     location.x = this.getPositionOffsetForNote(note);
    //     location.y = 300;
    //
    //     const flakeUnique: FlakePersonalization = {
    //         startingLocation: location
    //     }
    //
    //     const flake: Flake = {
    //         sections: 6,
    //         divisionsPerSection: 4,
    //         centerDeltas: [],
    //         draw: this.flakeDrawer,
    //         uniqueness: flakeUnique,
    //         melted: false
    //     }
    //
    //     return flake;
    // }

    // private flakeDrawerFactory: (initContext: any) => (frame: number, p: p5) => void = (initContext: any) => {
    //
    //
    //
    //
    //     return (frame: number, p: p5) => {
    //         this.p.beginShape(TRIANGLE_FAN);
    //         this.p.vertex(width / 2, height / 2);
    //
    //         for (let angle = 0; angle <= 360; angle += angleStep) {
    //             this.p.vertex(width / 2 + cos(radians(angle)) * radius, height / 2 + sin(radians(angle)) * radius);
    //             fill(angle, mouseX, mouseY);
    //
    //             endShape();
    //         }
    //     }
    //
    // }
    //

    private initMidi: () => void = () => {
        console.log('initializing midi');

        if (navigator.requestMIDIAccess) {
            console.log('This browser supports WebMIDI!');
        } else {
            console.log('WebMIDI is not supported in this browser.');
        }


        // @ts-ignore this totally exists
        this.midi.enable((err: any) => {
            if (!err) {
                console.log("enabled midi");
                console.log(`inputs: ${this.midi.inputs}`);
                this.midi.inputs.forEach(input => console.log(`Found midi input ${input.name}`));
                this.midi.inputs.forEach(input => {
                    // @ts-ignore this totally exists
                    input.addListener('noteon', 'all', this.noteOnHandler);
                    // @ts-ignore this totally exists
                    input.addListener('pitchbend', 'all', this.midiHandler);
                    // @ts-ignore this totally exists
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

    private noteOnHandler: (MIDIMessageEvent) => void = (midiEvent: MIDIMessageEvent): void => {

        console.log(`handling ${JSON.stringify(midiEvent)}`);
        // TODO: this needs to write a plane geom as in https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_colors.html
        // https://threejs.org/examples/#webgl_geometry_colors


        // @ts-ignore this totally exists
        this.flakes.push(this.createSnowFlake(midiEvent.note));

        // this.drawFlakeSphere(midiEvent.note, this.p.createVector(0,0));

        //createSphere(scene, midiEvent.note, noteTexture);
    }

    private midiHandler: (MIDIMessageEvent) => void = (midiEvent: MIDIMessageEvent) => {
        console.log(`midiEvent: ${JSON.stringify(midiEvent, null, "  ")}`);
    }

    private drawFlakeSphere: (Note, Flake, DrawContext) => void = (note: Note, flake: Flake, context: DrawContext) => {

    }

    private getPositionOffsetForNote: (Note) => number = (note: Note) => {
        switch (note.name) {
            case 'C':
                return this.octaveSize * (note.octave - this.middleCOctave) + 0 * this.noteSize;
            case 'C#':
                return this.octaveSize * (note.octave - this.middleCOctave) + 1 * this.noteSize;
            case 'D':
                return this.octaveSize * (note.octave - this.middleCOctave) + 2 * this.noteSize;
            case 'D#':
                return this.octaveSize * (note.octave - this.middleCOctave) + 3 * this.noteSize;
            case 'E':
                return this.octaveSize * (note.octave - this.middleCOctave) + 4 * this.noteSize;
            case 'F':
                return this.octaveSize * (note.octave - this.middleCOctave) + 5 * this.noteSize;
            case 'F#':
                return this.octaveSize * (note.octave - this.middleCOctave) + 6 * this.noteSize;
            case 'G':
                return this.octaveSize * (note.octave - this.middleCOctave) + 7 * this.noteSize;
            case 'G#':
                return this.octaveSize * (note.octave - this.middleCOctave) + 8 * this.noteSize;
            case 'A':
                return this.octaveSize * (note.octave - this.middleCOctave) + 9 * this.noteSize;
            case 'A#':
                return this.octaveSize * (note.octave - this.middleCOctave) + 10 * this.noteSize;
            case 'B':
                return this.octaveSize * (note.octave - this.middleCOctave) + 11 * this.noteSize;
            default:
                return 0;
        }
    }

    private newP5Vector(x: number, y: number): p5.Vector {
        const vec: p5.Vector = new p5.Vector();
        vec.x = x;
        vec.y = y;
        return vec;
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