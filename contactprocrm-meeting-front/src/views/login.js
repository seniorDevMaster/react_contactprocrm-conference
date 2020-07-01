import React, { useState } from "react";
import * as qs from 'query-string'
import WebRTC from '../webrtc';
import Slideshow from "../components/slideshow";

function Login(props) {
    const browserCompat = WebRTC.getInstance().checkBrowser() !== null;
    const [userName, setUserName] = useState(WebRTC.getInstance().getUserName());
    const [roomName, setRoomName] = useState(WebRTC.getInstance().generateRoomName());

    const token = qs.parse(props.location.search).token | '';
    const onStart = () => {
        // validate...
        if (userName!=='' && roomName !== ''){
            WebRTC.getInstance().setUserName(userName);
            WebRTC.getInstance().createRoom(token, roomName);
        }
    }

    return <div className='login'>
            
            {browserCompat? '': 'Error! Your Browser does not compatable for Video meeting. Please contact to administrator.' }
            <br ></br>
            <br ></br>
            <div style={{display: browserCompat?'block':'none'}}>
                <Slideshow />
                <table className='logintable'>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{lineHeight:3, fontSize:24}}>Create a video meeting room.</div>
                            </td>
                        </tr>
                        <tr>
                            <td align='right'>
                                Your Name:
                            </td>
                            <td>
                                <input className='logininput' type='text' placeholder='Enter your name...' value={userName} onChange={(e)=>{setUserName(e.target.value)}}></input>
                            </td>
                        </tr>
                        <tr>
                            <td align='right'>
                                Room Name:
                            </td>
                            <td>
                                <input type='text' className='logininput' placeholder='Enter room name...' value={roomName} onChange={(e)=>{setRoomName(e.value)}} disabled></input>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <input type='button' className='loginbutton' value='Create Room' onClick={onStart} disabled={!browserCompat}></input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>;
}
export default Login;
