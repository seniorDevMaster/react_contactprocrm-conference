import React, { useState } from "react"
import * as qs from "query-string"
import axios from "axios"
import { withRouter } from "react-router";

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import WebRTC from "../webrtc"
import Slideshow from "../components/slideshow"
import { API_URL } from "../config"

function Login(props) {
    const browserCompat = WebRTC.getInstance().checkBrowser() !== null
    // const [userName, setUserName] = useState(WebRTC.getInstance().getUserName());
    // const [roomName, setRoomName] = useState(WebRTC.getInstance().generateRoomName());

    // http://localhost:3000/login?room=admin-34e3cd9f6da8&username=admin

    const query = qs.parse(props.location.search)
    const userName = query.username
    const roomName = query.room

    const token = qs.parse(props.location.search).token | ""

    const onStart = () => {
        // validate...
        const headers = {
            "Content-Type": "application/json;charset=UTF-8",
        }
        axios
            .post(
                `${API_URL}/checkValidRoom`,
                {
                    type: 0,
                    roomName: roomName,
                },
                {
                    headers: headers,
                }
            )
            .then(
                (response) => {
                    console.log(response)
                    if (!response) {
                        toast("🦄 Invalid Room!", {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        })
                    } else {
                        if (userName !== "" && roomName !== "") {
                            WebRTC.getInstance().setUserName(userName)
                            WebRTC.getInstance().createRoom(token, roomName)
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
    }

    return (
        <div className="login">
            {browserCompat
                ? ""
                : "Error! Your Browser does not compatable for Video meeting. Please contact to administrator."}
            <br></br>
            <br></br>
            <div style={{ display: browserCompat ? "block" : "none" }}>
                <Slideshow />
                <table className="logintable">
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{ lineHeight: 3, fontSize: 24 }}>
                                    Create a video meeting room.
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">Your Name:</td>
                            <td>
                                <input
                                    className="logininput"
                                    type="text"
                                    placeholder="Enter your name..."
                                    value={userName}
                                    disabled
                                ></input>
                            </td>
                        </tr>
                        <tr>
                            <td align="right">Room Name:</td>
                            <td>
                                <input
                                    type="text"
                                    className="logininput"
                                    placeholder="Enter room name..."
                                    value={roomName}
                                    disabled
                                ></input>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <input
                                    type="button"
                                    className="loginbutton"
                                    value="Create Room"
                                    onClick={onStart}
                                    disabled={!browserCompat}
                                ></input>
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
        </div>
    )
}

export default withRouter(Login)
