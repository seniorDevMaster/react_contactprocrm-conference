import React, {useState} from 'react'
import { useDispatch } from 'react-redux'
import './index.css';
import usericon from '../../images/user.svg'
// import AudioMeter from '../audiometer'
import Button from '../button';
import WebRTC from '../../webrtc'

import camera_on from '../../images/webcam-on.png';
import camera_off from '../../images/webcam-off.png';
// import camera_no from '../../images/webcam-off.png';
import mic_on from '../../images/mic-on.png'
import mic_off from '../../images/mic-off.png'
// import mic_no from '../../images/mic-no.png'
import sendfile from '../../images/sendfile.png'
import record_on from '../../images/record-on.png'
import record_off from '../../images/record-off.png'
import photo_on from '../../images/photo-on.png'

let recorder = {};
let videodata = {};
const Users = (props) => {
    const dispatch = useDispatch();
    const [record, setRecord] = useState('on');
    function onRecord() {
        if(props.user.stream) {
            const id = props.user.stream.id;
            const video = document.getElementById(id);
            if(record === 'on'){
                // start record
                video.parentElement.style.backgroundColor = 'red';
                recorder[id] = new MediaRecorder(props.user.stream);
                videodata[id] = [];
                recorder[id].ondataavailable = event => videodata[id].push(event.data);
                recorder[id].onerror = onSaveVideo
                recorder[id].onstop = onSaveVideo
                recorder[id].start();
            } else {
                // stop record
                video.parentElement.style.backgroundColor = 'black';
                if(recorder[id])
                    recorder[id].stop();
            }    
        }
        setRecord(record === 'on' ? 'off' : 'on');
    }
    function onSaveVideo(event){
        const id = props.user.stream.id;
        if(videodata[id]){
            const blob = new Blob(videodata[id], { type: "video/mp4" });
            addBlob('Video captured.', blob)
        }
    }
    function onPhoto() {
        if(props.user.stream){
            const video = document.getElementById(props.user.stream.id);
            const canvas = document.getElementById('take_a_photo');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);  
            canvas.toBlob( (blob)=>{
                addBlob('Image captured.', blob)
            });
        };
    }
    function addBlob(msg, blob){
        dispatch({type:'chat_add', 
        value:{
            username: 'Me', 
            userid: 'me', 
            html: `${msg}<br><a href='${URL.createObjectURL(blob)}' target='_blank'>Click here to show.`,
            align: 'right', 
            time: Date.now()}})
    }
    return (<div style={{position:"relative", display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{display: 'flex', alignItems: 'center'}}>
                    <img src={usericon} alt={props.user.name} title={props.user.name} width='18px' height='25px' style={{marginTop:1}}></img>&nbsp;&nbsp;
                    <img src={ props.user.media.camera ==='on' ? camera_on: camera_off} alt={`Camera ${props.user.media.camera}`} title={`Camera ${props.user.media.camera}`} width='18px' height='18px'></img>&nbsp;
                    <img src={ props.user.media.mic ==='on' ? mic_on: mic_off} alt={`Mic ${props.user.media.mic}`} title={`Mic ${props.user.media.mic}`} width='18px' ></img>&nbsp;&nbsp;
                    <span style={{verticalAlign: 'top', color: 'black', lineHeight: 2, fontSize: 14}}>{props.user.name}</span>
                </span>
                {/* <AudioMeter audio={props.user.audio}></AudioMeter> */}
                <span style={{display: 'flex', alignItems: 'center'}}>
                    {props.user.id !== 'me' && <Button on={sendfile} off={sendfile} no={sendfile} status='on' onClick={()=>WebRTC.getInstance().sendFile(props.user.id, props.user.name, dispatch)} height='18px' alt='Send a file.'></Button>}
                    <Button on={photo_on} status='on' onClick={onPhoto} height='18px' alt='Capture a photo'></Button>
                    <Button on={record_on} off={record_off} status={record} onClick={onRecord} height='18px' alt={record==='on'?'Record video':'Stop record'}></Button>
                </span>
            </div>
    );
}
export default Users;