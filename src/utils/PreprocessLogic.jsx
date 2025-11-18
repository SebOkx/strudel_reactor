export function Preprocess({ inputText, volume, cpm, lpf }) {
    let outputText = inputText;

    //Update setcps based on cpm
    outputText = outputText.replace(/setcps\((\d+)(\/\d+\/\d+)?\)/, (match, p1, rest) =>
        `setcps(${cpm}${rest || ''})`
    );

    //Replace {$VOLUME} placeholders if any
    outputText = outputText.replaceAll("{$VOLUME}", volume);

    //Scale lpf if desired
    outputText = outputText.replaceAll(/lpf\(([\d.]+)\)/g, (match, captureGroup) =>
        `lpf(${captureGroup} * ${lpf})`
    );

    //Only modify gain() that is NOT postgain()
    outputText = outputText.replace(/(?<!post)gain\(([\d.]+)\)/g, (match, g) =>
        `gain(${g}*${volume})`
    );

    return outputText;
}
