class View {

    constructor(){
        this.btnRecorder = document.getElementById('record');
    }



    createVideoElement({muted = true, src, srcObject}){
        const video = document.createElement('video');

        video.src = src;
        video.srcObject = srcObject;
        video.muted = muted;

        if (src){
            video.controls = true;
            video.loop = true;

            Util.sleep(200).then(_ => video.play());
        }

        if (srcObject){
            video.addEventListener('loadedmetadata', () => video.play())
        }

        return video;
    }

    renderVideo({userId, stream = null, url = null, isCurrentId = false, muted = true}){
        var video = this.createVideoElement({src: url, srcObject: stream, muted});
        this.appendToHtmlTree(userId, video, isCurrentId)
    }

    appendToHtmlTree(userId, video, isCurrentId){
        const div = document.createElement('div');
        div.id = userId;
        div.classList.add('wrapper');
        div.append(video);

        const div2 = document.createElement('div');
        div2.innerHTML = isCurrentId ? '' :  userId;
        div.append(div2);

        const videoGrid = document.getElementById('video-grid');
        videoGrid.append(div);
    }

    setParticipants(count){
        const myself = 1;
        const participants = document.getElementById('participants');
        participants.innerHTML = (count + myself);
    }

    removeVideoElement(id){
        const videoElement = document.getElementById(id);
        videoElement.remove();
    }

    configureRecordButton(command){
        this.btnRecorder.addEventListener('click', this.onRecordClick(command))

    }

    toggleRecordingButtonColor(isActive){
        this.btnRecorder.style.color = isActive ? 'red' : 'white'
    }

    onRecordClick(command) {
        this.recordingEnabled = false
        return () => {
          const isActive = this.recordingEnabled = !this.recordingEnabled
          command(this.recordingEnabled);
          this.toggleRecordingButtonColor(isActive);
        }
    }
}

