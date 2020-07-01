import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import './index.css';
import EmojiField from './EmojiField'
import WebRTC from '../../webrtc'

const ChatInput = (props) => {
    const dispatch = useDispatch();
    const users = useSelector(state=>state.users);
    const onChange = (val)=>{
        // val = val.split('\n').join('<br>')
        if(users.length>0){
            dispatch({type: 'chat_add', value: {username: 'Me', userid:'me', text: val, align: 'right', time: Date.now()}})
            WebRTC.getInstance().sendMessage(val);
        }
    }
    const inputRef = useRef(null);
    return (
        <div className='chatinput'>
            <EmojiField 
                onChange={onChange}
                fieldType='textarea' 
                ref={inputRef}
                placeholder='Type messages here...'
            />
        </div>
    );
}
export default ChatInput;