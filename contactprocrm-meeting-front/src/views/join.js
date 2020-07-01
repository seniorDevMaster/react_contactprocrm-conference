import React, { useState } from "react";
import * as qs from 'query-string'
import WebRTC from '../webrtc';
import Slideshow from "../components/slideshow";

function Join(props) {
    const browserCompat = WebRTC.getInstance().checkBrowser() !== null;
    const [userName, setUserName] = useState(WebRTC.getInstance().getUserName());

    const room = qs.parse(props.location.search).room;

    const onJoin = () => {
        // validate...
        if (userName!==''){
            WebRTC.getInstance().setUserName(userName);
            WebRTC.getInstance().joinRoom('', room);
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
                                <div style={{lineHeight:3, fontSize:24}}>Join a video meeting room.</div>
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
                                <input type='text' className='logininput' placeholder='Enter room name...' value={room} disabled></input>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <input type='button' className='loginbutton' value='Join Room' onClick={onJoin} disabled={!browserCompat}></input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>;
}
export default Join;
