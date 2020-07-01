import React from 'react'
import { useSelector } from 'react-redux';
import './index.css';
import usericon from '../../images/user.svg'
import User from './user'
const Users = (props) => {
    const users = useSelector(state=>state.users);
    
    return (
        <div className='chats'>
            <table className='chattable'>
                <tbody>
                    <tr style={{height:25}}><td>
                        <div className='chatheader'> 
                            <img src={usericon} alt='chat' width='18px' height='20px'/>
                            <span style={{verticalAlign:'top'}}>&nbsp;&nbsp;Participants</span>
                        </div></td></tr>
                    <tr style={{height:'100%'}}>
                        <td>
                            <div className='userlist'>
                                {
                                    users.map((user) => {
                                        return (
                                        <div className='useritem' key={user.id} tabIndex={0}>
                                            <User user={user}/>
                                        </div>);
                                    })
                                }
                            </div>
                        </td></tr>
                </tbody>
            </table>
        </div>
    );
}
export default Users;