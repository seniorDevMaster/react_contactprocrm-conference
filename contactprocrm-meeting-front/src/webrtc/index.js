class WebRTC {
    static _instance = null;
    client = null;
    roomName = ''
    userName = ''
    videoQualities = [
        {text:'SD (360p - 1Mb/s)', value:{width: 480, height:360, frameRate: 10}},
        {text:'HD (720p - 2Mb/s)', value:{width: 1280, height:720, frameRate: 10}},
        {text:'Full HD (1080p - 4Mb/s)', value:{width: 1920, height:1080, frameRate: 15}},
    ]
    currentVideoQuality = this.videoQualities[0];
    audioQualities = [
        {text:'Narrow Band (16Kb/s)', value:{sampleSize: 8, channelCount: 1}},
        {text:'Wide Band (64Kb/s)', value:{sampleSize: 8, channelCount: 2}},
        {text:'Full Band (256Kb/s)', value:{sampleSize: 16, channelCount: 2}},
    ]
    currentAudioQuality = this.audioQualities[1];
    static getInstance(){
         if ( WebRTC._instance === null) {
             WebRTC._instance = new WebRTC();
         }
         return WebRTC._instance;
    }

    constructor() {
        console.log('WebRTC class was initialized.');
    }

    checkBrowser() {
        return window.Login._browserCompatCheck();
    }
    getUserName() {
        const username = window.localStorage.getItem('userName');
        return username ? username : '';
    }
    setUserName(name) {
        window.localStorage.setItem('userName', name)
    }
    getRoomName() {
        return this.roomName;
    }
    generateRoomName(){
        return window.generateRoomName();
    }
    createRoom(token, roomName) {
        window.localStorage.setItem('o', true)
        window.localStorage.setItem('t', 'contactprocrm-meeting')
        window.localStorage.setItem('r', roomName)
        window.location.href = '/room?username='+this.getUserName();

    }
    joinRoom(token, roomName) {
        window.localStorage.setItem('o', false)
        window.localStorage.setItem('t', 'contactprocrm-meeting')
        window.localStorage.setItem('r', roomName)
        window.location.href = '/room?username='+this.getUserName();
    }
    createAudioMeter(localstream) {
        var kSampleSize = 16384;
        var kSampleAverageInterval = 16;
        var audioContext = new AudioContext();
        var mediaStreamSource = audioContext.createMediaStreamSource(localstream);
        var processor = audioContext.createScriptProcessor(kSampleSize, 1, 1);

        mediaStreamSource.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = function(evt) {
            var buffer = evt.inputBuffer;
            if (buffer.numberOfChannels > 0) {
                var inputData = buffer.getChannelData(0);
                var inputDataLength = inputData.length;
                var total = 0;

                // We calculate the average of every X to prevent CPU fans from kicking in
                // on laptops!
                for (var i = 0; i < inputDataLength; i += kSampleAverageInterval) {
                    total += Math.abs(inputData[i]);
                }

                var rms = Math.sqrt((kSampleAverageInterval * total) / inputDataLength);
                // WebRTC.getInstance().client.sendPeerMessage();

                window.easyrtc.sendPeerMessage({
                    targetRoom: WebRTC.getInstance().roomName
                }, 'audio-meter', {
                    rms: rms
                });
            }
        };
    }
    toggleCamera (enable) {
        window.easyrtc.enableCamera(enable);
        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'media-presence', {type:'camera', status: enable?'on':'off'});
    }
    toggleMic (enable) {
        window.easyrtc.enableMicrophone(enable);
        if(this.client)
            this.client.sendPeerMessage({room: this.roomName}, 'media-presence', {type:'mic', status: enable?'on':'off'});
    }

    sendFile(peerId, peerName, dispatch) {
        const fileInput = window.$("#file");
        fileInput.one(
            'change',
            function(){
                const file = fileInput[0].files[0];
                if(file.size === 0){
                    alert("Empty file selected.");
                    return;
                }
                if(file.size > Math.pow(2, 21)){
                    alert("File size can't be larger than 2MB.");
                    return;
                }
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = function(e) {
                    var txData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        binaryContents: e.target.result
                    };
                    dispatch({type:'chat_add',
                        value:{
                            username: 'Me',
                            userid: 'me',
                            text: `Send a file "${file.name}" to "${peerName}".`,
                            align: 'right',
                            time: Date.now()}})
                    window.easyrtc.sendDataP2P(peerId, 'file', txData);
                };
                // Read in the image file as a data URL.
                reader.readAsDataURL(file);
                fileInput[0].value = ''
            }
        )
        fileInput[0].click();
        // .trigger('click');
    }
    exitRoom(){
        if(this.owner === 'true'){
            this.sendMessage('Room closed.');
            window.easyrtc.sendPeerMessage({
                targetRoom: WebRTC.getInstance().roomName
            }, 'close');
            this.dispatch({type:'chat_add', value:{username: 'Me', userid: 'me', text: 'Room closed.', align: 'right', time: Date.now()}})
        }
        window.easyrtc.disconnect();
    }
    updateStreamMode(){
        // get getUserMedia mode
        let mode = {video:false, audio: false}
        if(this.currentVideoDevice){
            mode.video = {}
            mode.video.deviceId = this.currentVideoDevice.value;
            mode.video.width = this.currentVideoQuality.value.width;
            mode.video.height = this.currentVideoQuality.value.height;
            mode.video.frameRate = this.currentVideoQuality.value.frameRate;
        }
        if(this.currentAudioDevice){
            mode.audio = {}
            mode.audio.deviceId = this.currentAudioDevice.value;
            mode.audio.sampleSize = this.currentAudioQuality.value.sampleSize;
            mode.audio.channelCount = this.currentAudioQuality.value.channelCount;
        }
        this.currentContraintMode = mode;
    }
    onStreamConfigurationChange(){
        this.updateStreamMode();
        const local = window.easyrtc.getLocalStream();
        local.getTracks().forEach(track=>{track.stop()})
        navigator.mediaDevices.getUserMedia(this.currentContraintMode).then(
            (stream)=>{
                // replace local stream
                stream.getTracks().forEach((track)=>{local.addTrack(track)})
                const video_me = document.getElementById(local.id)
                // console.log('onStreamConfigurationChange : ====== ',video_me);
                window.easyrtc.setVideoObjectSrc(video_me, stream)
                // send it to remote
                const peers = window.easyrtc.getPeerConnections()
                for(const id in peers){
                    const peer = peers[id]
                    if(peer.cancelled)
                        continue;
                    peer.pc.getSenders().map((sender) => {
                        console.log(id, sender);
                        sender.replaceTrack(stream.getTracks().find(track=>{
                            return track.kind === sender.track.kind
                        }));
                    });
                }
            }
        );

    }
    async updateDevices(){
        try{
            let audio = [];
            let video = [];
            const devices = await navigator.mediaDevices.enumerateDevices();
            for(const dev of devices){
                if(dev.kind === 'audioinput'){
                    const found = audio.filter(ele=>ele.text.indexOf(dev.label)===0)
                    if(found.length>0)
                        audio = [...audio, {text:dev.label+'-'+found.length, value: dev.deviceId}]
                    else
                        audio = [...audio, {text:dev.label, value: dev.deviceId}]
                }
                if(dev.kind === 'videoinput'){
                    const found = video.filter(ele=>ele.text.indexOf(dev.label)===0)
                    if(found.length>0)
                        video = [...video, {text:dev.label+'-'+found.length, value: dev.deviceId}]
                    else
                        video = [...video, {text:dev.label, value: dev.deviceId}]

                }
            }
            this.videoDevices = video;
            this.audioDevices = audio;
        }catch(e){
        }
    }
    async startRoom(dispatch, token, room, userName) {

        this.userName = userName;
        this.roomName = room ? room : window.localStorage.getItem('r');
        console.log('roomName: ',this.roomName)
        if(!this.roomName){
            window.location.href = '/';
            return;
        }
        this.dispatch = dispatch;
        await this.updateDevices();
        this.currentVideoDevice = this.videoDevices.length === 0 ? null: this.videoDevices[0];
        this.currentAudioDevice = this.audioDevices.length === 0 ? null: this.audioDevices[0];
        // this.updateStreamMode()

        this.owner = window.localStorage.getItem('o')
        this.token = window.localStorage.getItem('t');

        // console.log('--------owner : token :', this.owner, ' : ', this.token)
        window.localStorage.removeItem('o');
        window.localStorage.removeItem('t');
        window.localStorage.removeItem('r');

        window.easyrtc.enableDataChannels(true);
        window.VTCCore
        .initialize({
            cameraIsEnabled: true,
            micIsEnabled: true
        })
        .onError(function(config) {
            console.log("error---", config);
        })
        .onPeerMessage(function(client, peerId, msgType, content) {
            if (msgType === 'chat') {
                dispatch({type:'chat_add', value:{username: client.idToName(peerId), userid: peerId, text: content, align: 'left', time: Date.now()}})
            } else if (msgType === 'media-presence' &&
                       typeof content.type === 'string' &&
                       typeof content.status === 'string') {
                            dispatch({type:'user_media', value: { id: peerId, type: content.type, status: content.status}})

            } else if (msgType === 'debug') {
                // @todo XXX(debug): handle debug messages
                console.log(msgType, peerId, content);
                // if (dbgListener !== null) {
                //     dbgListener.handlePeerMessage(client, peerId, content);
                // } else {
                //     ErrorMetric.log('peerMessage => debug message got in non-debug mode!');
                // }
            } else if (msgType === 'mic-control' && typeof content.enabled === 'boolean') {
                console.log(client, peerId, msgType, content)
                // @todo FIXME XXX XXX: Might be an issue with this feature. The ability to remotely
                //                      mute/unmute people might not be so cool (namely the unmute part).
                //                      For now, leave it in, but think about disabling the unmute feature
                //                      or having a config flag to deal with it.

                // 'mic-control' peerMessage
                //   Example format:
                //     {
                //       enabled : boolean
                //     }
                //
                return;
                // if (peerId !== client.getId()) {
                //     // Toggle the micBtn only if the requested microphone state is false (microphone disabled)
                //     // and the current state is enabled.
                //     //
                //     // @todo XXX: probably not a good idea to have remote unmute capabilities
                //     if (!content.enabled && content.enabled !== NavBar.micBtn.isSelected()) {
                //         // clickButton is called because this causes the mute overlay to show up
                //         NavBar.micBtn.clickButton();
                //     }
                // } else {
                //     ErrorMetric.log('peerMessage => got a mute request from myself...ignoring');
                // }
            } else if (msgType === 'audio-meter') {
                // dispatch({type:'user_audio', value: {audio: content.rms});
                // AudioMeter.handlePeerMessage(peerId, content);
            } else if (msgType === 'file'){
                var arr = content.binaryContents.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while(n--){
                    u8arr[n] = bstr.charCodeAt(n);
                }
                var blob = new Blob([u8arr], {type:mime});
                dispatch({type:'chat_add',
                        value:{
                            username: client.idToName(peerId),
                            userid: peerId,
                            html: `"${client.idToName(peerId)}" sent a file.<br><a href='${URL.createObjectURL(blob)}' target='_blank'>Click here to download ${content.name}(${content.size}bytes)`,
                            align: 'left',
                            time: Date.now()}})
                
                var today = new Date().toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
                const msgData = {
                    message: `"${URL.createObjectURL(blob)}'`,
                    title: `"${client.idToName(peerId)}" sent a ${content.name} file.`,
                    time: today
                }

                // const peerId = client.getId()
                // const peerName = client.idToName(client.getId()) 
                // const roomName = WebRTC.getInstance().roomName
                WebRTC.getInstance().onSendSocketMessage(peerId, client.idToName(peerId), WebRTC.getInstance().roomName, msgData);
            } else if(msgType === 'close'){
                console.log("Room closed...")
                window.easyrtc.disconnect();
                window.location.href = '/';
            } else {
                // @todo FIXME: right now we don't have other messages to take care of
                console.log('peerMessage => got a peer message that is unexpected');
                console.log('            => peerId:  ' + peerId);
                console.log('            =>   name: ' + client.idToName(peerId));
                console.log('            => msgType: ' + msgType);
                console.log('            => content: ' + JSON.stringify(content));
            }
        })
        .onStreamAccept(function(client, peerId, stream) {
            var peerName = client.idToName(peerId);
            console.log("stream accpet", peerId, peerName, stream);

            dispatch({type: 'user_add', value: {id: peerId, name: peerName, stream} })
            WebRTC.getInstance().onStreamConfigurationChange();

            return;
        })
        .onStreamClose(function(client, peerId) {
            dispatch({type:'user_remove', value: { id: peerId }});
            return;
        })
        .connect(userName, this.roomName, function(client) {
            console.log('start local stream', client)
            var stream = client.getLocalStream();
            dispatch({type: 'user_add', value: {id: 'me', name: 'Me', stream} })
            setTimeout(()=>{
                WebRTC.getInstance().onStreamConfigurationChange();
                WebRTC.getInstance().client = client;
            }, 500);
            return;
        });

    }
    sendMessage(message){
        this.client.sendPeerMessage({room: this.roomName}, 'chat', message);

        var today = new Date().toLocaleDateString(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })

        const msgData = {
            message: message,
            time: today
        }
        const peerId = this.client.getId()
        const peerName = this.client.idToName(this.client.getId()) 
        const roomName = WebRTC.getInstance().roomName
        WebRTC.getInstance().onSendSocketMessage(peerId, peerName, roomName, msgData);
    }
    onSetScreenCapture(){
        this.updateStreamMode();
        const local = window.easyrtc.getLocalStream();
        local.getTracks().forEach(track=>{track.stop()})
        // navigator.mediaDevices.getUserMedia(this.currentContraintMode).then(
        navigator.mediaDevices.getDisplayMedia({video:{width: 1920, height:1080, frameRate: 5}}).then(
            async (stream)=>{
                const audioStream = await navigator.mediaDevices.getUserMedia({audio:true});
                stream.addTrack(audioStream.getAudioTracks()[0]);
                // replace local stream
                stream.getTracks().forEach((track)=>{local.addTrack(track)})
                const video_me = document.getElementById(local.id)
                // console.log('-----------local: ', local.id);
                window.easyrtc.setVideoObjectSrc(video_me, stream)
                // send it to remote
                const peers = window.easyrtc.getPeerConnections()
                for(const id in peers){
                    const peer = peers[id]
                    if(peer.cancelled)
                        continue;
                    peer.pc.getSenders().map((sender) => {
                        console.log(id, sender);
                        sender.replaceTrack(stream.getTracks().find(track=>{
                            return track.kind === sender.track.kind
                        }));
                    });
                }
            }
        );
    }

    onSendSocketMessage(peerId, peerName, roomName, msgData) {
        window.easyrtc.sendServerMessage('save_message_content', 
            {
                clientId:   peerId, 
                clientName: peerName, 
                roomName:   roomName,
                content:    msgData
            },
            function(msgType, data){
                console.log('webrtc: sendMessage: ', data)
            }, function(errorCode, errorText){
                console.log('errorText: ', errorText)
            }
        );
    }
}
export default WebRTC;
