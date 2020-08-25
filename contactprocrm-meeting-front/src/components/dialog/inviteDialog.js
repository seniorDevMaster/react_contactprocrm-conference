import React from 'react';

import './index.css';
import Button from '../button';
import copy from '../../images/copy.svg'
import WebRTC from '../../webrtc'

function InviteDialog(props){
    return (
        <div className='invitedialog' id = 'invitedialog'>
            <div className='subdialog' style={{padding:20}}>
            {/* <div style={{color:'white', fontSize:18, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding:20, width: 300}}> */}
                <div style={{width: '100%', fontWeight: 'bold', paddingBottom: 10}}>Copy the following URL.</div>
                <span>https://chat.contactprocrm.com/#/join?room={WebRTC.getInstance().getRoomName()}</span>
                <Button on={copy} status='on' onClick={()=>{
                    navigator.clipboard.writeText(`https://chat.contactprocrm.com/#/join?room=${WebRTC.getInstance().getRoomName()}`); 
                    window.$('#invitedialog').plainModal('close');
                }} height={20}/>
            </div>
        </div>
    )
}
export default InviteDialog;
