import React, { useRef } from 'react';

export default function LoadSave() {
    const fileInputRef = useRef(null);

    //Load handler -----------------
    const handleLoadClick = () => {
        fileInputRef.current.click(); //open file picker
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
            const procElement = document.getElementById("proc");

            if (procElement) {
                procElement.value = result;
            } else {
                console.error("Element not found.");
            }
        };
        reader.readAsText(files[0]);
    };

    //Save handler -------------------
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

            {/*powers the file chooser */}
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
