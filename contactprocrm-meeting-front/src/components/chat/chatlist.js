import React from 'react';
import { useSelector } from 'react-redux';
import './index.css';


function makeTwo(digit){
    if (digit < 10)
        return '0' + digit;
    return '' + digit;
}
function timeToLocal(time) {
    const t = new Date(time)
    return `${makeTwo(t.getHours())}:${makeTwo(t.getMinutes())}`
}
const ChatList = (props) => {
    const chats = useSelector(state=>state.chats);
    let before_userid = '';
    let before_timestring = '';
    // console.log('chats: ', chats)
    return (
        <div className='chatlist'>
            {
                chats.map((chat) => {
                    const showid = chat.userid !== before_userid && chat.userid !== 'me';
                    const show_timestring = showid || timeToLocal(chat.time) !== before_timestring;
                    before_userid = chat.userid;
                    before_timestring = timeToLocal(chat.time);
                    return (
                        <div key={ chat.key } className='chatitemparent' style={{textAlign: chat.align}}>
                            <table width='100%'>
                                <tbody>
                                    <tr>
                                        <td rowSpan={2} width={35} valign='top'>
                                            { showid && chat.username !== 'Me' && <div className='chatUserName' style={{backgroundColor: chat.color}}>{chat.username.substring(0,2)}</div>}
                                        </td>
                                        <td style={{fontSize:12,color: 'white'}}>
                                            {show_timestring && chat.username!=='Me' ? chat.username + ',   ': '' }
                                            {show_timestring ? before_timestring : ''}</td>
                                    </tr>
                                    <tr>
                                        <td align={chat.align}>
                                            <span className={'chatitem-'+chat.align} style={{backgroundColor: chat.color}} tabIndex={0}>
                                                {chat.text && chat.text.split('\n').map((line)=>{return (<>{line}<br></br></>)}) }
                                                {chat.html && <div dangerouslySetInnerHTML={{ __html: chat.html }} />}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            
                        </div>
                    );
                })
            }
        </div>
    );
}
export default ChatList;