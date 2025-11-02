function DJControls() { //Component dedicated to composing music.
    return (
        <>
            <div class="input-group mb-3">
                <span class="input-group-text" id="bpm-label">BPM</span>
                <input type="number" class="form-control" aria-label="BPM" aria-describedby="bpm-label" min="60" max="200" value="120" />
                
            </div>

            <label for="volumeRange" class="form-label">Volume</label >
            <input type="range" class="form-range" min="0" max="100" id="volumeRange" value="50" />

            <div className="form-check-input" type="checkbox" value="" id="s1" />
            <label className="form-check-label" f0r="s1">
                s1
            </label>

            <div className="form-check-input" type="checkbox" value="" id="d1" />
            <label className="form-check-label" f0r="d1">
                d1
            </label>

            <div className="form-check-input" type="checkbox" value="" id="d2" />
            <label className="form-check-label" f0r="d2">
                d2
            </label>

        </>
  );
}

export default DJControls;