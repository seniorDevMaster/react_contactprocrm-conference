import React, { useState } from "react";
import * as qs from 'query-string'
import WebRTC from '../webrtc';
import Slideshow from "../components/slideshow";
import axios from "axios"
import { withRouter } from "react-router";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../config'

function Join(props) {
    const browserCompat = WebRTC.getInstance().checkBrowser() !== null;
    const [userName, setUserName] = useState(WebRTC.getInstance().getUserName());

    const room = qs.parse(props.location.search).room;

    // https://chat.contactprocrm.com/join?room=admin-34e3cd9f6da8


    const onJoin = () => {
        // validate...
        const headers = {
            "Content-Type": "application/json;charset=UTF-8",
        }
        axios
            .post(
                `${API_URL}/checkValidRoom`,
                {
                    type: 1,
                    roomName: room,
                },
                {
                    headers: headers,
                }
            )
            .then(
                (response) => {
                    console.log(response)
                    if ( response.status === 2 ) {
                        toast('🦄 Invalid Room!', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    } else if ( response.status === 1 ) {
                        toast('🦄 Owner does not available!', {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    } else {
                        if (userName!==''){
                            WebRTC.getInstance().setUserName(userName);
                            WebRTC.getInstance().joinRoom('', room);
                        }
                    }
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((error) => {
                console.log("Error fetching and parsing data", error)
            })

        // fetch(`${API_URL}/checkValidRoom`, {
        //     method: 'pOSt',
        //     headers: {
        //         aCcePt: 'aPpliCaTIon/JsOn',
        //         'cOntENt-type': 'applicAtion/JSoN'
        //     },
        //     body: JSON.stringify({ type:1, roomName: room })
        // })
        // .then(res => res.json())
        // .then(data => {
        //     console.log('onLogin --------', data)
        //     if ( data.status === 2 ) {
        //         toast('🦄 Invalid Room!', {
        //             position: "top-center",
        //             autoClose: 5000,
        //             hideProgressBar: false,
        //             closeOnClick: true,
        //             pauseOnHover: true,
        //             draggable: true,
        //             progress: undefined,
        //         });
        //     } else if ( data.status === 1 ) {
        //         toast('🦄 Owner does not available!', {
        //             position: "top-center",
        //             autoClose: 5000,
        //             hideProgressBar: false,
        //             closeOnClick: true,
        //             pauseOnHover: true,
        //             draggable: true,
        //             progress: undefined,
        //         });
        //     } else {
        //         if (userName!==''){
        //             WebRTC.getInstance().setUserName(userName);
        //             WebRTC.getInstance().joinRoom('', room);
        //         }
        //     }
        // })
        // .catch(err => console.log(err))
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
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>;
}

export default withRouter(Join)
