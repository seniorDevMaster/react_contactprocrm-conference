import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './index.css';

import logo from '../../images/logo.png';
import camera_on from '../../images/webcam-on.png';
import camera_off from '../../images/webcam-off.png';
import camera_no from '../../images/webcam-off.png';
import mic_on from '../../images/mic-on.png'
import mic_off from '../../images/mic-off.png'
import mic_no from '../../images/mic-no.png'
// import screen_on from '../../images/screen-on.png'
// import screen_off from '../../images/screen-off.png'
import screen_no from '../../images/screen-no.png'
import chat_on from '../../images/chat-on.png'
import chat_off from '../../images/chat-off.png'
import invite from '../../images/invite.png'
import sharedscreen_on from '../../images/screen-on.png'
import sharedscreen_off from '../../images/screen-off.png'
import sharedscreen_no from '../../images/screen-no.png'
import fullscreen_on from '../../images/fullscreen-on.svg'
import fullscreen_off from '../../images/fullscreen-off.svg'
import close from '../../images/close.svg'
import disconnect from '../../images/disconnect.svg'
import setting from '../../images/setting.svg'

import Button from '../button';
import WebRTC from '../../webrtc'
import Dialog from '../dialog';
import SettingDialog from '../dialog/settingDialog';
import InviteDialog from '../dialog/inviteDialog';

function NavBar() {
    const dispatch = useDispatch();
    const camera = useSelector(state => state.buttons.camera);
    const mic = useSelector(state => state.buttons.mic);
    // const screen = useSelector(state => state.buttons.screen);
    const chat = useSelector(state => state.buttons.chat);
    const [sharedscreen, setSharedscreen] = useState('on')
    const fullscreen = useSelector(state => state.buttons.fullscreen);

    const toggleChange = (type1, value1)=>{
        dispatch( {type: type1, value: value1 ==='on'?'off':'on'});
        if(type1 === 'click_camera'){
            dispatch({type:'user_media', value: { id: 'me', type: 'camera', status: value1 ==='on'?'off':'on'}})
            WebRTC.getInstance().toggleCamera(value1==='off')
        } else if ( type1 === 'click_mic') {
            dispatch({type:'user_media', value: { id: 'me', type: 'mic', status: value1 ==='on'?'off':'on'}})
            WebRTC.getInstance().toggleMic(value1==='off')
        } else if ( type1 === 'click_screenshare') {
            if (sharedscreen == 'on') {
                WebRTC.getInstance().onSetScreenCapture()
                setSharedscreen('off')
            }
            else {
                WebRTC.getInstance().onStreamConfigurationChange()
                setSharedscreen('on')
            }
        } else if ( type1 === 'click_fullscreen') { // click_fullscreen
            gotoFullscreen(value1);
        }
    }
    const gotoFullscreen = (status)=>{
        console.log(status)
        if(status === 'on')
            document.documentElement.requestFullscreen();
        else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) { /* Firefox */
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE/Edge */
                    document.msExitFullscreen();
                }
        }
    }
    const exitRoom = ()=>{
        WebRTC.getInstance().exitRoom();
    }
    return (
        <div className='center'>
            <div className='navbar'>
                <img src={logo} alt='2M Solutions' height='30px' style={{paddingTop: 5}}></img>&nbsp;&nbsp;&nbsp;
                <Button on={camera_on} off={camera_off} no={camera_no} alt='Camera' status={camera} onClick={()=>toggleChange('click_camera', camera)}></Button>
                <Button on={mic_on} off={mic_off} no={mic_no} alt='Mic' status={mic} onClick={()=>toggleChange('click_mic', mic)}></Button>
                <Button on={chat_on} off={chat_off} no={screen_no} alt='Chat' status={chat} onClick={()=>toggleChange('click_chat', chat)}></Button>
                <Button on={invite} off={invite} no={invite} alt='Invite person' status='on' onClick={()=>{Dialog.show('invitedialog')}}></Button>
                <Button on={sharedscreen_on} off={sharedscreen_off} no={sharedscreen_no} alt='Screen share' status={sharedscreen} onClick={()=>toggleChange('click_screenshare', sharedscreen)}></Button>
                <span style={{zoom:0.75, padding:7}}>
                    <Button on={fullscreen_on} off={fullscreen_off} alt={`Full screen ${fullscreen}`}  status={fullscreen} onClick={()=>toggleChange('click_fullscreen', fullscreen)}></Button>
                </span>
                <span style={{zoom:0.8, padding:7}}>
                    <Button on={setting} alt={`Video / Audio setting`}  status={'on'} onClick={()=>{Dialog.show('settingdialog')}} ></Button>
                </span>
                <span style={{zoom:0.8, padding:7}}>
                    <Button on={WebRTC.getInstance().owner==='true'? close : disconnect} alt={`Exit room`}  status={'on'} onClick={exitRoom} ></Button>
                </span>
            </div>
            <SettingDialog />
            <InviteDialog />
        </div>
    );
}
export default NavBar;
