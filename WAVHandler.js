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
            value: 2,
        },
        sampleRate: {
            size: 4,
            value: 22050,
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
            value: 8,
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
            size: undefined,
            value: undefined,
        },
    };

    // http://soundfile.sapp.org/doc/WaveFormat/

    constructor(config) {
        const {
            subchunk1Size,
            audioFormat,
            numChannels,
            sampleRate,
            bitsPerSample,
        } = config;

        let { fields } = this;

        fields.subchunk1Size.value = subchunk1Size;
        fields.audioFormat.value = audioFormat;
        fields.numChannels.value = numChannels;
        fields.sampleRate.value = sampleRate;
        fields.bitsPerSample.value = bitsPerSample;

        fields.byteRate.value =
            (fields.sampleRate *
                fields.numChannels.value *
                fields.bitsPerSample.value) /
            8;
        fields.blockAlign.value =
            (fields.numChannels.value * fields.bitsPerSample.value) / 8;
    }

    setSubchunk2Size(subchunk2Size) {
        this.fields.subchunk2Size.value = subchunk2Size;
        this.fields.chunkSize.value = 36 + subchunk2Size;
    }

    setData(data) {
        this.fields.data.value = data;

        const subchunk2Size = data.length * 2;
        this.setSubchunk2Size(subchunk2Size);
    }

    getString() {
        let file = "";

        let { fields } = this;

        let fieldNames = Object.keys(fields);

        for (let name of fieldNames) {
            file += this.valueToField(fields[name].value, fields[name].size);
        }

        return file;
    }

    valueToField(value, size) {
        if (typeof value == "string") {
            return value;
        }

        if (typeof value == "object") {
            let file = "";
            for (let point of value) {
                file +=
                    this.valueToField(point.x, 1) +
                    this.valueToField(point.y, 1);
            }
            return file;
        }

        let field = "";

        for (let i = 0; i < size; i++) {
            let byte = value % 256;
            field += String.fromCharCode(byte);
            value = (value - byte) / 256;
        }

        return field;
    }
}
