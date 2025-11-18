
export async function loadSamples() {
    const base = "https://raw.githubusercontent.com/felixroos/dough-samples/main/";
    try {
        const { samples } = await import('@strudel/webaudio');
        //avoid reloading multiple times by storing a flag on window
        if (!window.__strudelSamplesLoaded) {
            await Promise.all([
                samples(`${base}tidal-drum-machines.json`),
                samples(`${base}piano.json`),
                samples(`${base}Dirt-Samples.json`),
                samples(`${base}EmuSP12.json`),
                samples(`${base}vcsl.json`),
                samples(`${base}mridangam.json`),
            ]);
            window.__strudelSamplesLoaded = true;
            console.log("Strudel samples preloaded");
        } else {
            console.log("Strudel samples already loaded; skipping");
        }
    } catch (err) {
        console.warn("Failed to preload samples:", err);
        //don't rethrow since app should still work, just no preloaded samples
    }
}

export default loadSamples;
