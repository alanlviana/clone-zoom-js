class Business{
    constructor({room, media, view, socketBuilder}){
        this.room = room
        this.media = media
        this.view = view

        this.socket = socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())
            .build()

        this.socket.emit('join-room', this.room, 'test01')

        this._currentStream = {}
    }

    static initialize(deps){
        const instance = new Business(deps);
        return instance._init();
    }

    async _init(){
        this._currentStream = await this.media.getCamera();
        this.addVideoStream('test01')
    }

    addVideoStream(userId, stream = this._currentStream){
        const isCurrentId = false;
        
        this.view.renderVideo({
            userId,
            stream,
            isCurrentId
        })
    }

    onUserConnected = function(){
        return userId => {
            console.log('userConnected', userId);
        }
    }
    onUserDisconnected = function(){
        return userId => {
            console.log('userDisconnected', userId);
        }
    }
}