import React, { useEffect, useState } from 'react'
import './index.css';
import User from '../users/user'
import Button from '../button';
import speaker_on from '../../images/speaker-on.svg'
import speaker_off from '../../images/speaker-off.svg'

const Screen = (props) => {
    useEffect(()=>{
        setTimeout(()=>{
            const video = document.getElementById(props.user.stream.id);
            window.easyrtc.setVideoObjectSrc( video, props.user.stream);
        }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [muted, setMuted] = useState(props.user.id==='me' ? true: false)
    const toggleMute = ()=>{
        setMuted(!muted)
        const video = document.getElementById(props.user.stream.id);
        if(video)
            video.muted = !muted;
    }
    const screenid = 'screen_'+props.user.id 
    return (
        <div key={props.user.id} id={screenid} className='screen' style={{width: props.width, height: props.height}} tabIndex={0} onDoubleClick={()=>document.getElementById(screenid).requestFullscreen()}>
            <div className='videoStatus'>
                <User user={props.user}/>
            </div>
            <video className='video' id={props.user.stream.id} controls="" loop="" muted={'Me' === props.user.name}></video>
            {
                props.user.id !=='me' && 
                (<div className='speaker'>
                    <Button on={speaker_on} off={speaker_off} status={muted?'off':'on'} onClick={toggleMute}></Button>
                </div>
                )
            }
            
        </div>
    );
}
export default Screen;