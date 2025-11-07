import React from 'react';

const NoteSequence = ({ notes }) => {
    return (
        <div className="note-sequence">
            {notes.map((note, index) => (
                <div key={index} className="note">
                    {note}
                </div>
            ))}
        </div>
    );
};

export default NoteSequence;
