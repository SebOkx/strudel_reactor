export function Preprocess({ inputText, volume, cpm, lpf }) {
    //lpf is low pass filter value
    let outputText = inputText;

   
    outputText = outputText.replace(/setcps\((\d+)(\/\d+\/\d+)?\)/, (match, p1, rest) => `setcps(${cpm}${rest || ''})`);

    outputText += `\n//all(x => x.gain(${volume}))`

    outputText = outputText.replaceAll("{$VOLUME}", volume)

    outputText = outputText.replaceAll(/lpf\(([\d.]+)\)/g, (match, captureGroup) =>
       `lpf(${captureGroup} * ${lpf})`
    );

    let regex = /[a-zA-Z0-9_]+:\s*\n[\s\S]+?\r?\n(?=[a-zA-Z0-9_]*[:\/])/gm;

    let m;

    let matches = []

    while ((m = regex.exec(outputText)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match, groupIndex) => {
            matches.push(match)
        });
    }

    let matches2 = matches.map(
        match => match.replaceAll(/(?<!post)gain\(([\d.]+)\)/g, (match, captureGroup) =>
            `gain(${captureGroup}*${volume})`
        )
    );

    let matches3 = matches.reduce(
        (text, original, i) => text.replaceAll(original, matches2[i]),
        outputText);

    console.log(matches3)
    return matches3;


}