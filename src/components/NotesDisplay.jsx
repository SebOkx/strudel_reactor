import React from 'react';
import InstrumentLayer from './InstrumentLayer';

const NotesDisplay = ({ layers }) => {
    console.log(`Layers prop:`, layers); 
    return (
        <div className="song-display">
            {layers.map((layer, index) => (
                <InstrumentLayer key={index} layer={layer} />
            ))}
        </div>
    );
};

export default NotesDisplay;
