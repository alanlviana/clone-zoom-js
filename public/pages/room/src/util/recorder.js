class Recorder{
    constructor(userName, stream){
        this.userName = userName;
        this.stream = stream;

        this.videoType = "video/webm";
        this.filename = `id:${this.userName}-when${Date.now()}`

        this.mediaRecorder = {};
        this.recordedBlobs = [];
        this.completeRecording = []
        this.recordingActive = false;
    }

    _setup(){
        const commonCodecs = [
            "codecs=vp9,opus",
            "codecs=vp8,opus",
            ""
        ]

        const options = commonCodecs.map(
            codec => ({mimeType: `${this.videoType};${codec}`})
        ).find(options => {
            console.log('buscando', options.mimeType);
            return MediaRecorder.isTypeSupported(options.mimeType)
        })
        

        if (!options){
            throw new Error(`none of the codecs: ${commonCodecs.join(',')} are supported`)
        }

        return options;
    }

    startRecording(){
        const options = this._setup();
        if(!this.stream.active) return;

        this.mediaRecorder = new MediaRecorder(this.stream, options);

        console.log('media recorder created', {mediaRecorder: this.mediaRecorder, options});

        this.mediaRecorder.onstop = (e) => {
            console.log('media recorder stop', this.recordedBlobs);
        }

        this.mediaRecorder.ondataavailable = (e) => {
            if (!e.data || !e.data.size) return;

            this.recordedBlobs.push(e.data);
        }

        this.mediaRecorder.start();
        console.log('media recorded started', this.mediaRecorder);
        this.recordingActive = true;
    }

    async stopRecording(){
        if (!this.recordingActive) return;

        if (this.mediaRecorder.state === 'inative') return;

        console.log('media recorded stopped', this.userName);
        this.mediaRecorder.stop();
        this.recordingActive = false;
        await Util.sleep(200);
        this.completeRecording.push([...this.recordedBlobs]);
        this.recordedBlobs = [];
    }
}