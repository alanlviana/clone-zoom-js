class Business{
    constructor({room, media, view, socketBuilder, peerBuilder}){
        this.room = room
        this.media = media
        this.view = view
        this.socketBuilder = socketBuilder
        this.peerBuilder = peerBuilder

        this.socket = {};
        this._currentStream = {}
        this.currentPeer = {}
        this.peers = new Map();
        this.userRecordings = new Map();
    }

    static initialize(deps){
        const instance = new Business(deps);
        return instance._init();
    }

    async _init(){
        this._currentStream = await this.media.getCamera();

        this.view.configureRecordButton(this.OnRecordPressed.bind(this));

        this.socket =  this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())
            .build()

        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.OnPeerConnectionOpened())
            .setOnCallReceived(this.OnPeerCallReceived())
            .setOnPeerStreamReceived(this.OnPeerStreamReceived())
            .setOnCallError(this.OnCallError())
            .setOnCallClose(this.OnCallClose())
            .build();

        this.addVideoStream(this.currentPeer.id, this._currentStream, true);
    }

    addVideoStream(userId, stream = this._currentStream, isCurrentId = false){        
        const recorderInstance = new Recorder(userId, stream);
        this.userRecordings.set(recorderInstance.filename, recorderInstance);

        if(this.recordingEnabled){
            recorderInstance.startRecording();
        }

        this.view.renderVideo({
            userId,
            stream,
            isCurrentId,
            muted: true
        })
    }

    onUserConnected = function(){
        return userId => {
            console.log('calling a peer', userId);
            this.currentPeer.call(userId, this._currentStream);
        }
    }
    onUserDisconnected = function(){
        return userId => {
            console.log('userDisconnected', userId);
            if( this.peers.has(userId) ){
                this.peers.get(userId).call.close();
                this.peers.delete(userId)
            }

            this.view.setParticipants(this.peers.size);
            this.view.removeVideoElement(userId);
        }
    }

    onPeerError = function(){
        return error => {
            console.error('error on peer!', error);
        }
    }
    OnPeerConnectionOpened = function(){
        return peer => {
            const id = peer.id;
            console.log('peer connected!', peer);
            this.socket.emit('join-room', this.room, id);
        }
    }

    OnPeerCallReceived = function(){
        return call => {
            console.log('answering a call', call);
            call.answer(this._currentStream);
        }
    }


    OnPeerStreamReceived = function(){
        return (call, stream) => {
            const callerId = call.peer;
            console.log('OnPeerStreamReceived', call);
            this.peers.set(callerId, {call})
            this.addVideoStream(callerId, stream);
            this.view.setParticipants(this.peers.size);
        }
    }

    OnCallError = function(){
        return (call, error) => {
            const callerId = call.peer;
            console.error('an call error ocurred', error);
            this.view.removeVideoElement(callerId);
        }
    }
    OnCallClose = function(){
        return (call) => {
            console.log('call closed!', call.peer)
        }
    }   

    OnRecordPressed(recordingEnabled){
        this.recordingEnabled = recordingEnabled;
        for(const [key, value] of this.userRecordings){
            if(this.recordingEnabled){
                value.startRecording();
                continue;
            }

            value.stopRecording();
        }
    }
    
}