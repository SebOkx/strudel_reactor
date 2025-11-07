import React from 'react';
import NoteSequence from './NoteSequence';


const InstrumentLayer = ({ layer }) => {
    return (
        <div className="instrument-layer">
            <h3>{layer.name}</h3>
            <NoteSequence notes={layer.notes} />
        </div>
    );
};

export default InstrumentLayer;
