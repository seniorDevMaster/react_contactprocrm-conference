import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import './index.css';
import Screen from '../screen';
import WebRTC from '../../webrtc';

function matchSize(width, height) {
    let a = width / 16;
    if (width / 16 > height / 9) {
        a = height / 9;
    }
    return [a * 16, a * 9];
}
function bestMatchSize(width, height, count) {
    width *= 0.9;
    height *= 0.9;
    let maxW = 1;
    let maxH = 1;
    for (let i = 1; i <= count; i++) {
        const [w, h] = matchSize(width / i, height / (Math.ceil(count / i)));
        if ( w * i <= width && h * (Math.ceil(count / i)) <= height && maxW < w) {
            maxW = w;
            maxH = h;
        }
    }
    return [maxW, maxH];
}
function getClientSize(setSize) {
    setInterval(()=>{
        const ele = document.getElementById('videoFrame');
        const elements = document.getElementsByClassName('video')
        if(ele){
            const [w,h] = bestMatchSize(ele.clientWidth - 50, ele.clientHeight - 80, elements.length);
            return setSize([w, h]);
        }
        return setSize([0, 0]);
    }, 50);

}

function ScreenContainer() {
    const users = useSelector(state=>state.users);
    const [size, setSize] = useState([0,0]);
    useEffect(()=>{
        getClientSize(setSize);
    }, [])

    const browserDetect = WebRTC.getInstance().browserDetect()
    return (
        <div className='videoFrame' id='videoFrame' style={{height: browserDetect==='Firefox'?'90vh':'100%'}}>
        {
            users.map((user) => {
                return (<div key={user.id} style={{margin: 1}}>
                            <Screen user={user} width={size[0]} height={size[1]}/>
                        </div>);
            })
        }
        </div>
    );
}
export default ScreenContainer;