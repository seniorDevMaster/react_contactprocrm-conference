import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './index.css';
import Button from '../button';
import sidebar_hide from '../../images/sidebar-hide.png';
import sidebar_show from '../../images/sidebar-show.png';
import Users from '../users';
import Chat from '../chat';
import WebRTC from '../../webrtc';

let startTime = 0;
const makeTwo = (digit) => {
    if (digit < 10)
        return '0' + digit;
    return '' + digit;
}
const secToTimeString = (time) => {
    let min = Math.floor(time / 60);
    let sec = time - min * 60;
    return makeTwo(min) + ':' + makeTwo(sec);
}
const Sidebar = (props) => {
    const chat = useSelector(state=>state.buttons.chat);
    const [time, setTime] = useState(0);
    const dispatch = useDispatch();
    const toggleShow = (status) => {
        dispatch({type: 'click_chat', value: chat === 'on'? 'off':'on'})
    }
    useEffect(()=>{
        setInterval(()=>{ startTime++; setTime(startTime); }, 1000)
    },[]);
    const browserDetect = WebRTC.getInstance().browserDetect()
    
    return (
        <div className='sidebar' style={{display: chat==='on'? 'block': 'none', height: browserDetect==='Firefox'?'100vh':'100%'}}>
            <div className='mark'>
                <Button on={sidebar_hide} off={sidebar_show} status={chat} onClick={toggleShow}></Button>
            </div>
            <table style={{width:'100%', height:'100%'}}>
                <tbody>
                    <tr style={{height:'5%'}}>
                        <td>
                            <div style={{color: 'black', fontSize:16}}>Room: {WebRTC.getInstance().roomName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Time: {secToTimeString(time)} </div>
                        </td>
                    </tr>
                    <tr style={{height:'15%'}}>
                        <td >
                            <Users />
                        </td>
                    </tr>
                    <tr style={{height:'80%'}}>
                        <td>
                            <Chat/>
                        </td>
                    </tr>
                </tbody>
            </table>
            
        </div>
    );
}
export default Sidebar;