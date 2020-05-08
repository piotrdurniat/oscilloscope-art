class WAVHandler {
    fields = {
        // The "RIFF" chunk descriptor
        chunkID: {
            size: 4,
            value: "RIFF",
        },
        chunkSize: {
            size: 4,
            value: undefined,
        },
        format: {
            size: 4,
            value: "WAVE",
        },
        // The "fmt" subchunk
        subchunk1ID: {
            size: 4,
            value: "fmt ",
        },
        subchunk1Size: {
            size: 4,
            value: 16,
        },
        audioFormat: {
            size: 2,
            value: 1,
        },
        numChannels: {
            size: 2,
            value: undefined,
        },
        sampleRate: {
            size: 4,
            value: undefined,
        },
        byteRate: {
            size: 4,
            value: undefined,
        },
        blockAlign: {
            size: 2,
            value: undefined,
        },
        bitsPerSample: {
            size: 2,
            value: undefined,
        },
        // The "data" sub-chunk
        subchunk2ID: {
            size: 4,
            value: "data",
        },
        subchunk2Size: {
            size: 4,
            value: undefined,
        },
        data: {
            size: 0,
            value: [],
        },
    };

    fileString = "";

    // http://soundfile.sapp.org/doc/WaveFormat/

    constructor(config) {
        const { numChannels, sampleRate, bitsPerSample } = config;

        let { fields } = this;

        fields.numChannels.value = numChannels;
        fields.sampleRate.value = sampleRate;
        fields.bitsPerSample.value = bitsPerSample;

        fields.byteRate.value =
            (fields.sampleRate.value *
                fields.numChannels.value *
                fields.bitsPerSample.value) /
            8;
        fields.blockAlign.value =
            (fields.numChannels.value * fields.bitsPerSample.value) / 8;
    }

    setSubchunk2Size(subchunk2Size) {
        this.fields.subchunk2Size.value = subchunk2Size;
        this.setChunkSize(36 + subchunk2Size);
    }

    setChunkSize(chunkSize) {
        this.fields.chunkSize.value = chunkSize;
    }

    setData(data) {
        this.fields.data.value = data;

        this.setSubchunk2Size(data.length * 2);
        this.generateFileString();
    }

    addData(data) {
        const newDataField = this.generateDataField(data);
        fileString.concat(newDataField);
    }

    generateFileString() {
        let file = "";

        const { fields } = this;

        let fieldNames = Object.keys(fields);

        for (let name of fieldNames) {
            let value = fields[name].value;
            let size = fields[name].size;

            if (name === "data") {
                file += this.generateDataField(value);
                continue;
            }

            if (typeof value === "string") {
                file += value;
                continue;
            }

            file += this.generateField(value, size);
        }
        console.log(file);
        this.fileString = file;
    }

    getFileString() {
        return this.fileString;
    }

    generateField(value, size) {
        let field = "";

        for (let i = 0; i < size; i++) {
            let byte = value % 256;
            field += String.fromCharCode(byte);
            value = (value - byte) / 256;
        }

        return field;
    }

    generateDataField(data) {
        let field = "";
        for (let point of data) {
            field +=
                String.fromCharCode(point.x) + String.fromCharCode(point.y);
        }
        return field;
    }
}
