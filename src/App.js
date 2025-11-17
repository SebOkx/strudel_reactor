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

//a custom hook that encapsulates all Strudel/editor lifecycle and provides an API
function useStrudelEditor({ editorRootRef, canvasRef, defaultCode }) {
    const instanceRef = useRef(null);
    const hasBakedRef = useRef(false);

    const setCode = useCallback((code) => {
        if (instanceRef.current) instanceRef.current.setCode(code);
    }, []);

    const evaluate = useCallback(() => {
        if (instanceRef.current) instanceRef.current.evaluate();
    }, []);

    const stop = useCallback(() => {
        if (instanceRef.current) instanceRef.current.stop();
    }, []);

    useEffect(() => {
        if (!editorRootRef.current || !canvasRef.current) return;

        //only initialize once
        if (instanceRef.current) return;

        const canvas = canvasRef.current;
        //scale for high dpi
        canvas.width = canvas.width * 2;
        canvas.height = canvas.height * 2;
        const ctx = canvas.getContext('2d');
        const drawTime = [-2, 2];

        instanceRef.current = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: editorRootRef.current,
            drawTime,
            onDraw: (haps, time) => drawPianoroll({ haps, time, ctx, drawTime, fold: 0 }),
            prebake: async () => {
                //this runs before evaluation, only need to load once
                if (hasBakedRef.current) return;
                initAudioOnFirstClick();
                const loadModules = evalScope(
                    import('@strudel/core'),
                    import('@strudel/draw'),
                    import('@strudel/mini'),
                    import('@strudel/tonal'),
                    import('@strudel/webaudio'),
                );
                await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                hasBakedRef.current = true;
            },
        });

        //ensure the editor starts with code
        instanceRef.current.setCode(defaultCode);

        return () => {
            // best-effort cleanup if StrudelMirror exposes a destroy API; otherwise null the ref
            try {
                if (instanceRef.current && typeof instanceRef.current.destroy === 'function') {
                    instanceRef.current.destroy();
                }
            } catch (err) {
                //ignore
            }
            instanceRef.current = null;
        };
    }, [canvasRef, editorRootRef, defaultCode]);

    return useMemo(() => ({
        setCode,
        evaluate,
        stop,
        get instance() { return instanceRef.current; },
    }), [setCode, evaluate, stop]);
}

//Small UI subcomponents that can be moved to /components later maybe
function EditorPane({ editorRootRef }) {
    return (
        <div id="editor" ref={editorRootRef} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(55,48,163,0.04)', marginBottom: 12, background: '#f3f4f6' }} />
    );
}

function OutputPane() {
    return <div id="output" style={{ borderRadius: 8, background: '#f3f4f6', minHeight: 40, marginBottom: 12 }} />;
}

export default function StrudelDemoRefactor() {
    //local refs instead of global variables
    const editorRootRef = useRef(null);
    const canvasRef = useRef(null);

    //UI state
    const [procText, setProcText] = useState(stranger_tune);
    const [volume, setVolume] = useState(1);
    const [cpm, setCpm] = useState(140);
    const [lpf, setLpf] = useState(5);
    const [playingState, setPlayingState] = useState('stop');

    //init console monkey patch and d3 event listener once
    useEffect(() => {
        console_monkey_patch();
        const handleD3Data = (e) => console.log('d3Data', e.detail);
        document.addEventListener('d3Data', handleD3Data);
        return () => document.removeEventListener('d3Data', handleD3Data);
    }, []);

    //instantiate Strudel editor with hook
    const editor = useStrudelEditor({ editorRootRef, canvasRef, defaultCode: procText });

    //keyboard space toggle (useEffect with clean up)
    useEffect(() => {
        const onKeyDown = (ev) => {
            if (ev.code === 'Space') {
                ev.preventDefault();
                //toggle evaluate
                if (editor.instance) editor.instance.evaluate();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [editor]);

    //derived output from preprocess
    const buildPreprocessed = useCallback(() => {
        return Preprocess({ inputText: procText, volume, cpm, lpf });
    }, [procText, volume, cpm, lpf]);

    const handlePlay = useCallback(() => {
        const outputText = buildPreprocessed();
        editor.setCode(outputText);
        editor.evaluate();
        setPlayingState('play');
    }, [editor, buildPreprocessed]);

    const handleStop = useCallback(() => {
        editor.stop();
        setPlayingState('stop');
    }, [editor]);

    const handleProcOnly = useCallback(() => {
        //set code but don't auto-play
        const output = buildPreprocessed();
        editor.setCode(output);
    }, [editor, buildPreprocessed]);

    //react to changes that should rerun while playing
    useEffect(() => {
        if (playingState === 'play') handlePlay();
        //only want to rerun when one of these three change
    }, [volume, cpm, lpf]);

    return (
        <div style={{ background: 'linear-gradient(135deg, #ce7e00 0%, #f1c232 100%)', minHeight: '100vh', padding: 32 }}>
            <h1 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 900, letterSpacing: '1px', color: '#3730a3' }}>Strudel</h1>

            <main>
                <div className="container-fluid" style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(55,48,163,0.08)', background: '#b45f06', padding: 24 }}>
                    <div className="row" style={{ marginBottom: 16 }}>
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: 16 }}>
                            <PreprocessArea defaultValue={procText} onChange={(e) => setProcText(e.target.value)} />
                        </div>

                        <div className="col-md-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <nav style={{ width: '100%' }}>
                                <PlayButtons onPlay={() => { setPlayingState('play'); handlePlay(); }} onStop={handleStop} />
                                

                                <br />
                                {/* <ProcButtons onProc={handleProcOnly} onProcPlay={() => { handleProcOnly(); handlePlay(); }} />   */}
                            </nav>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: 16 }}>
                            <EditorPane editorRootRef={editorRootRef} />
                            <OutputPane />
                        </div>

                        <div className="col-md-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

                <canvas id="roll" ref={canvasRef} style={{ display: 'block', margin: '32px auto 0', borderRadius: 12, boxShadow: '0 2px 12px rgba(55,48,163,0.08)', background: '#00000', width: '100%', maxWidth: 900, height: 200 }} />
            </main>
        </div>
    );
}
