import './App.css';
import { useEffect, useRef } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';
import DJControls from './components/DJControls';
import PlayButtons from './components/PlayButtons';
import ProcButtons from './components/ProcButtons';
import PreprocessArea from './components/PreprocessArea';
import { useState } from 'react';
import { Preprocess } from './utils/PreprocessLogic';


let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

export function SetupButtons() {

    document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
    document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
    document.getElementById('process').addEventListener('click', () => {
        Proc()
    }
    )
    document.getElementById('process_play').addEventListener('click', () => {
        if (globalEditor != null) {
            Proc()
            globalEditor.evaluate()
        }
    }
    )
}



export function ProcAndPlay() {
    if (globalEditor != null && globalEditor.repl.state.started == true) {
        console.log(globalEditor)
        Proc()
        globalEditor.evaluate();
    }
}

export function Proc() {

    let proc_text = document.getElementById('proc').value
    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
    ProcessText(proc_text);
    globalEditor.setCode(proc_text_replaced)
}

export function ProcessText(match, ...args) {

    let replace = ""
    //if (document.getElementById('flexRadioDefault2').checked) {
      //  replace = "_"
    //}

    return replace
}

export default function StrudelDemo() {

    const hasRun = useRef(false);

    const handlePlay = () => {

        let outputText = Preprocess({ inputText: procText, volume: volume })
        globalEditor.setCode(outputText)
        globalEditor.evaluate();

    }
    const handleStop = () => {
        globalEditor.stop();
    }

    
    const [procText, setProcText] = useState(stranger_tune)

    const [volume, setVolume] = useState(1);

    const [state, setState] = useState("stop");

    useEffect(() => {
        if (state === "play") {
            handlePlay();
        }
        
    },[volume])

    useEffect(() => {

        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;
            //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
            //init canvas
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2]; // time window of drawn haps
            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: document.getElementById('editor'),
                drawTime,
                onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
                prebake: async () => {
                    initAudioOnFirstClick(); // needed to make the browser happy (don't await this here..)
                    const loadModules = evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio'),
                    );
                    await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                },
            });
            document.getElementById('proc').value = stranger_tune
            //SetupButtons()
            //Proc()
        }
        globalEditor.setCode(procText);
    }, [procText]);


    return (
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', minHeight: '100vh', padding: '32px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', fontWeight: 700, letterSpacing: '1px', color: '#3730a3' }}>Strudel Demo</h2>
            <main>
                <div className="container-fluid" style={{ borderRadius: '16px', boxShadow: '0 4px 24px rgba(55,48,163,0.08)', background: '#fff', padding: '24px' }}>
                    <div className="row" style={{ marginBottom: '16px' }}>
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '16px' }}>
                            <PreprocessArea defaultValue={procText} onChange={(e) => setProcText(e.target.value)} />
                        </div>
                        <div className="col-md-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <nav style={{ width: '100%' }}>
                                <ProcButtons onProc={() => { }}
                                    onProcPlay={() => { setState("play"); handlePlay() }} />
                                <br />
                                <PlayButtons onPlay={() => { setState("play"); handlePlay() }} onStop={() => { setState("stop"); handleStop(); }} />
                            </nav>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '16px' }}>
                            <div id="editor" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(55,48,163,0.04)', marginBottom: '12px', background: '#f3f4f6' }} />
                            <div id="output" style={{ borderRadius: '8px', background: '#f3f4f6', minHeight: '40px', marginBottom: '12px' }} />
                        </div>
                        <div className="col-md-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DJControls volumeChange={volume} onVolumeChange={(e) => setVolume(e.target.value)} />
                        </div>
                    </div>
                </div>
                <canvas id="roll" style={{ display: 'block', margin: '32px auto 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(55,48,163,0.08)', background: '#eef2ff', width: '100%', maxWidth: '900px', height: '200px' }}></canvas>
            </main >
        </div >
    );
}