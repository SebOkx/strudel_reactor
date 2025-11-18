function DJControls({ volume, onVolumeChange, cpm, onCpmChange, lpf, onLpfChange }) {
    return (
        <>
            {/* CPM Setter*/}
            <div className="input-group mb-3"> 
                <span className="input-group-text" id="cpm-label">CPM</span>
                <input type="number" className="form-control" placeholder="120" aria-label="CPM"aria-describedby="cpm_label" value={cpm} min={30} max={300} step={1} onChange={onCpmChange}
                />
            </div>

            {/* Volume Slider */}
            
            <label htmlFor="volumeRange" className="form-label">Volume</label>
            <input type="range" className="form-range" min="0" max="2" step="0.1" value={volume} onChange={onVolumeChange} id="volume_range" />

            {/* LPF Slider */}
            <label htmlFor="lpfRange" className="form-label">LPF</label>
            <input type="range" className="form-range" min="0" max="20" step="0.1" value={lpf} onChange={onLpfChange} id="lpf_range" />


        </>
  );
}

export default DJControls;