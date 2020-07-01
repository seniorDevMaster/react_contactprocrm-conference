import React, {useEffect, useState} from 'react';

import './index.css';
import ComboSelect from 'react-combo-select';
import 'react-combo-select/style.css';
import WebRTC from '../../webrtc';

function SettingDialog(props){
    const [audioDevices, setAudioDevices] = useState([]);
    const [videoDevices, setVideoDevices] = useState([]);
    function onRefresh(){
        WebRTC.getInstance().updateDevices()
        setAudioDevices(WebRTC.getInstance().audioDevices)
        setVideoDevices(WebRTC.getInstance().videoDevices)
    }
    function onVideoSourceChange(text, value){
        WebRTC.getInstance().currentVideoDevice = {text, value}
        onStreamConfigurationChange();
    }
    function onAudioSourceChange(text, value){
        WebRTC.getInstance().currentAudioDevice = {text, value}
        onStreamConfigurationChange();
    }
    function onVideoQualityChange(text, value){
        console.log(text, value);
        WebRTC.getInstance().currentVideoQuality = {text, value}
        onStreamConfigurationChange();
    }
    function onAudioQualityChange(text, value){
        WebRTC.getInstance().currentAudioQuality = {text, value}
        onStreamConfigurationChange();
    }
    function onStreamConfigurationChange(){
        WebRTC.getInstance().onStreamConfigurationChange();
    }

    useEffect(()=>{
        setTimeout(()=>{
            setAudioDevices(WebRTC.getInstance().audioDevices)
            setVideoDevices(WebRTC.getInstance().videoDevices)    
        }, 1000)
    },[]);
    return (
        <div className='settingdialog' id = 'settingdialog'>
            <div className='subdialog'>
                <div className='dialogheader'>
                    <span>Device Setting</span>
                    <span onClick={()=>{window.$('#settingdialog').plainModal('close')}}>x</span>
                </div>
                <div className='settingcontent'>
                    <div style={{width: '49%', height:'100%'}}>
                        <div style={{display:'flex', justifyContent:'space-between', padding:10, color: '#80FF80'}}>
                            <span>Devices</span>
                            <span onClick={()=>{onRefresh()}}>refresh</span>
                        </div>
                        <div style={{height:1, left:0, right:0, marginLeft:10, marginRight:10, backgroundColor:'#FFFFFF30'}}></div>
                        <div style={{padding:20}}>Video Source List</div>
                        <div style={{paddingLeft:20, paddingRight:20}}>
                            <ComboSelect sort={'off'} data={videoDevices} onChange={(t,v)=>{onVideoSourceChange(v,t);}} text={WebRTC.getInstance().currentVideoDevice?WebRTC.getInstance().currentVideoDevice.text:'No available devices'}/>
                        </div>
                        <div style={{padding:20}}>Audio Source List</div>
                        <div style={{paddingLeft:20, paddingRight:20}}>
                            <ComboSelect sort={'off'} data={audioDevices} onChange={(t,v)=>{onAudioSourceChange(v,t);}} text={WebRTC.getInstance().currentAudioDevice?WebRTC.getInstance().currentAudioDevice.text:'No available devices'} />
                        </div>
                    </div>
                    <div style={{width: 1, height:'98%', backgroundColor: '#eeFFFF50'}}></div>
                    <div style={{width: '49%', height:'100%'}}>
                    <div style={{display:'flex', justifyContent:'space-between', padding:10, color: '#80FF80'}}>
                            <span>Qualities</span>
                        </div>
                        <div style={{height:1, left:0, right:0, marginLeft:10, marginRight:10, backgroundColor:'#FFFFFF30'}}></div>
                        <div style={{padding:20}}>Quality of Video</div>
                        <div style={{paddingLeft:20, paddingRight:20}}>
                            <ComboSelect sort={'off'} data={WebRTC.getInstance().videoQualities} onChange={(v,t)=>{onVideoQualityChange(t,v);}} text={WebRTC.getInstance().currentVideoQuality.text}/>
                        </div>
                        <div style={{padding:20}}>Quality of Audio</div>
                        <div style={{paddingLeft:20, paddingRight:20}}>
                            <ComboSelect sort={'off'} data={WebRTC.getInstance().audioQualities} onChange={(v,t)=>{onAudioQualityChange(t,v);}} text={WebRTC.getInstance().currentAudioQuality.text} />
                        </div>
                    </div>
                </div>               
            </div>
        </div>
    )
}
export default SettingDialog;