import React, { useRef } from 'react';

export default function LoadSave({ onLoad }) {
    const fileInputRef = useRef(null);

    const handleLoadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            alert("No file selected");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;

            //keep the DOM textarea in sync
            const procElement = document.getElementById("proc");
            if (procElement) procElement.value = result;

            //update react state in the parent
            if (typeof onLoad === 'function') {
                onLoad(result);
            }
        };
        reader.readAsText(files[0]);

        //allow same file to be selected later
        event.target.value = '';
    };

    const handleSaveClick = () => {
        const procElement = document.getElementById("proc");
        if (!procElement) {
            console.error("Element not found");
            return;
        }

        const textToSave = procElement.value;

        try {
            const blob = new Blob([textToSave], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "song.txt";
            link.click();

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Could not save file:", err);
        }
    };

    return (
        <div>
            <button onClick={handleLoadClick} className="btn btn-dark btn-lg">Load Song</button>
            <button onClick={handleSaveClick} className="btn btn-dark btn-lg">Save Song</button>

            <input
                type="file"
                accept=".txt,.json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </div>
    );
}

