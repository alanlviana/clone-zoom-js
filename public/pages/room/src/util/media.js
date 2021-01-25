class Media {
    constructor(){

    }

    async getCamera(audio = false, video = true){
        return navigator.mediaDevices.getUserMedia({
            audio,
            video
        });
    }
}