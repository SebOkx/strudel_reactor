import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './music/stranger_things_song';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';
import DJControls from './components/DJControls';
import PlayButtons from './components/PlayButtons';
import ProcButtons from './components/ProcButtons';
import PreprocessArea from './components/PreprocessArea';
import { Preprocess } from './utils/PreprocessLogic';
import LoadSave from './components/LoadSave';

import D3Graph from "./components/D3Graph";

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);

};

export function SetupButtons() {
    document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
    document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
    document.getElementById('process').addEventListener('click', () => {
        Proc();
    });
    document.getElementById('process_play').addEventListener('click', () => {
        if (globalEditor != null) {
            Proc();
            globalEditor.evaluate();
        }
    });
}


export function ProcAndPlay() {
    if (globalEditor != null && globalEditor.repl.state.started == true) {
        console.log(globalEditor);
        Proc();
        globalEditor.evaluate();
    }
}

export function Proc() {
    let proc_text = document.getElementById('proc').value;
    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
    ProcessText(proc_text);
    globalEditor.setCode(proc_text_replaced);
}

export function ProcessText(match, ...args) {
    let replace = "";
    // if (document.getElementById('flexRadioDefault2').checked) {
    //     replace = "_"
    // }
    return replace;
}

//helper: try to read cpm and lpf from a song text
function extractMetadataFromSong(text = "") {
    const meta = {};

 
    const setcps = text.match(/setcps\(\s*([0-9]+(?:\.[0-9]+)?)(?=(?:\s*\/|\s*\)))/i);
    if (setcps) meta.cpm = Number(setcps[1]);

   
    if (!meta.cpm) {
        const cpmMatch = text.match(/\bcpm\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i);
        if (cpmMatch) meta.cpm = Number(cpmMatch[1]);
    }

    const lpfMatch = text.match(/\blpf\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (lpfMatch) meta.lpf = Number(lpfMatch[1]);

    const metaLine = text.match(/(?:\/\/|\/\*)\s*meta\s*[:\-]?\s*([^\n\*]+)/i);
    if (metaLine) {
        const m = metaLine[1];
        const c = m.match(/cpm\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i);
        const l = m.match(/lpf\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)/i);
        if (c) meta.cpm = Number(c[1]);
        if (l) meta.lpf = Number(l[1]);
    }

    return meta; //may be {}
}

export default function StrudelDemo() {

    document.addEventListener('keydown', function (event) {  //Press space to start/stop
        if (event.code === 'Space') {
            event.preventDefault();
            if (globalEditor != null) {
                globalEditor.evaluate();
            }
        }
    });

   

    const hasRun = useRef(false);

    const [procText, setProcText] = useState(stranger_tune);
    const [volume, setVolume] = useState(1);
    
    const [state, setState] = useState("stop");
    const [cpm, setCpm] = useState(140);
    const [lpf, setLpf] = useState(5);

    const handlePlay = () => {
        let outputText = Preprocess({
            inputText: procText,
            volume: volume,
            cpm: cpm,
            lpf: lpf
        });

        globalEditor.setCode(outputText);
        globalEditor.evaluate();
    };

    const handleStop = () => {
        globalEditor.stop();
    };

    useEffect(() => {
        const scope = evalScope({
            onEvent: (ev) => {
                // show the entire event object in the console in an inspectable form
                console.log("%c[hap] STRUDEL EVENT:", "color: purple; font-weight: bold", ev);

                // show a JSON snapshot (useful if console shows proxies)
                try { console.log("JSON:", JSON.stringify(ev, null, 2)); } catch (e) { /* circular -> ignore */ }

               
            }
        });

        return () => {
            // if Strudel exports a dispose/stop for scope, call it here.
            if (scope && scope.dispose) scope.dispose();
        };
    }, []);


    useEffect(() => {


        if (state === "play") {
            handlePlay();

        }
    }, [volume, cpm, lpf]);
    const [d3Data, setD3Data] = useState([]);

    useEffect(() => {

        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;

            //init canvas
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;

            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2];

            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: document.getElementById('editor'),
                drawTime,
                onDraw: (haps, time) => {
                    
                    const values = haps.map(h => (h.gain || 0) * (h.pitch || 1));

                    setD3Data(values); //updates D3 graph

                    //still draw the existing pianoroll
                    drawPianoroll({
                        haps, time, ctx: drawContext, drawTime, fold: 0
                    });
                }
,
                prebake: async () => {
                    initAudioOnFirstClick();
                    const loadModules = evalScope(

                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio'),
                    );
                    await Promise.all([
                        loadModules,
                        registerSynthSounds(),
                        registerSoundfonts()
                    ]);
                },
            });

            document.getElementById('proc').value = stranger_tune;
        }

        globalEditor.setCode(procText);

        //keep the textarea in sync
        const procEl = document.getElementById('proc');
        if (procEl && procEl.value !== procText) procEl.value = procText;

        const meta = extractMetadataFromSong(procText);
        if (meta.cpm !== undefined) setCpm(prev => (prev === meta.cpm ? prev : meta.cpm));
        if (meta.lpf !== undefined) setLpf(prev => (prev === meta.lpf ? prev : meta.lpf));
    }, [procText]);


    return (
        <div style={{ background: 'linear-gradient(135deg, #ce7e00 0%, #f1c232 100%)', minHeight: '100vh', padding: '32px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '24px', fontWeight: 900, letterSpacing: '1px', color: '#3730a3' }}>Strudel</h1>
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
                
                <D3Graph data={d3Data} />

            </div>

            <LoadSave onLoad={(text) => setProcText(text)} />

            <main>
                <div className="container-fluid"
                    style={{
                        borderRadius: '16px',
                        boxShadow: '0 4px 24px rgba(55,48,163,0.08)',
                        background: '#b45f06',
                        padding: '24px'
                    }}>
                    <div className="row" style={{ marginBottom: '16px' }}>
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '16px' }}>
                            <PreprocessArea
                                value={procText}
                                onChange={(e) => setProcText(e.target.value)}
                            />

                        </div>

                        <div className="col-md-4"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <nav style={{ width: '100%' }}>
                                {/*<ProcButtons*/}
                                {/*    onProc={() => { }}*/}
                                {/*    onProcPlay={() => { setState("play"); handlePlay(); }}*/}
                                {/*/>*/}
                                <br />
                                <PlayButtons
                                    onPlay={() => { setState("play"); handlePlay(); }}
                                    onStop={() => { setState("stop"); handleStop(); }}
                                />
                            </nav>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-8"
                            style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '16px' }}>
                            <div id="editor"
                                style={{
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(55,48,163,0.04)',
                                    marginBottom: '12px',
                                    background: '#f3f4f6'
                                }}
                            />
                            <div id="output"
                                style={{
                                    borderRadius: '8px',
                                    background: '#f3f4f6',
                                    minHeight: '40px',
                                    marginBottom: '12px'
                                }}
                            />
                        </div>

                        <div className="col-md-4"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DJControls
                                volume={volume}
                                onVolumeChange={(e) => setVolume(Number(e.target.value))}
                                cpm={cpm}
                                onCpmChange={(e) => setCpm(Number(e.target.value))}
                                lpf={lpf}
                                onLpfChange={(e) => setLpf(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <canvas id="roll"
                    style={{
                        display: 'block',
                        margin: '32px auto 0',
                        borderRadius: '12px',
                        boxShadow: '0 2px 12px rgba(55,48,163,0.08)',
                        background: '#00000',
                        width: '100%',
                        maxWidth: '900px',
                        height: '200px'
                    }}
                ></canvas>

            </main>
        </div>
    );
}
