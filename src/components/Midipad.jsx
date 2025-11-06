import React from 'react';
import './Midipad.css';

export default function Midipad() {
    
    return (
        <div className="midipad-container">
            
            <div className="midipad-grid">
                {[...Array(4)].map((_, rowIdx) => (
                    <div className="midipad-row" key={rowIdx}>
                        {[...Array(4)].map((_, colIdx) => (
                            <button className="midipad-pad" key={colIdx}>
                                {rowIdx * 4 + colIdx + 1}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
