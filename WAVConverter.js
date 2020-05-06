const fields = [
    // The "RIFF" chunk descriptor
    {
        name: "chunkID",
        size: 4,
    },
    {
        name: "chunkSize",
        size: 4,
    },

    {
        name: "format",
        size: 4
    },
    // The "fmt" sub-chunk
    {
        name: "subchunk1ID",
        size: 4,
    },
    {
        name: "subchunk1Size",
        size: 4,
    },
    {
        name: "audioFormat",
        size: 2,
    },
    {
        name: "numChannels",
        size: 2,
    },
    {
        name: "sampleRate",
        size: 4,
    },
    {
        name: "byteRate",
        size: 4,
    },
    {
        name: "blockAlign",
        size: 2,
    },
    {
        name: "bitsPerSample",
        size: 2,
    },
    // The "data" sub-chunk
    {
        name: "subchunk2ID",
        size: 4,
    },
    {
        name: "subchunk2Size",
        size: 4
    },
];


const configExample = {
    subchunk1Size: 16,
    audioFormat: 1, // PCM = 1 (i.e. Linear quantization) Values other than 1 indicate some form of compression.
    numChannels: 2,
    sampleRate: 22050,
    bitsPerSample: 8,
}

// http://soundfile.sapp.org/doc/WaveFormat/

// Return a stereo WAV file built from the provided data arrays.
function makeWAV(configPart, data) {

    const config = configPart;

    const { numChannels, sampleRate, bitsPerSample } = config;

    const subchunk2Size = data.length * 2;

    config.subchunk2Size = subchunk2Size;

    config.chunkID = "RIFF";
    config.format = "WAVE";
    config.subchunk1ID = "fmt ";
    config.subchunk2ID = "data";

    config.chunkSize = 36 + subchunk2Size;
    config.byteRate = sampleRate * numChannels * bitsPerSample / 8;
    config.blockAlign = numChannels * bitsPerSample / 8;

    // console.log(config);


    let file = "";

    for (field of fields) {
        file += numToField(config[field.name], field.size)
    }

    // Add "data" field;

    for (let point of data) {
        file += numToField(point.x, 1) + numToField(point.y, 1);
    }

    // console.log(file);
    return file;
}

function numToField(num, size) {

    if (typeof (num) == "string") return num;

    let field = "";

    for (let i = 0; i < size; i++) {
        let byte = num % 256;
        field += String.fromCharCode(byte);
        num = (num - byte) / 256;
    }

    return field;
}