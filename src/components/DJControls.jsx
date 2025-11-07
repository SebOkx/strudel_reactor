function DJControls({ volume, onVolumeChange, cpm, onCpmChange, lpf, onLpfChange }) {
    return (
        <>
            <div className="input-group mb-3">
                <span className="input-group-text" id="cpm-label">CPM</span>
                <input type="number" className="form-control" placeholder="120" aria-label="CPM"aria-describedby="cpm_label" value={cpm} min={30} max={300} step={1} onChange={onCpmChange}
                />
            </div>

            <label htmlFor="volumeRange" className="form-label">Volume</label>
            <input type="range" className="form-range" min="0" max="2" step="0.1" value={volume} onChange={onVolumeChange} id="volume_range" />

           
            <label htmlFor="lpfRange" className="form-label">LPF</label>
            <input type="range" className="form-range" min="0" max="30" step="0.1" value={lpf} onChange={onLpfChange} id="lpf_range" />


        </>
  );
}

export default DJControls;