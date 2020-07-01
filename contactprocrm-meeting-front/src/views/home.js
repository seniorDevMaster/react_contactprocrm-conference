import React, { useLayoutEffect, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import * as qs from 'query-string'

import './index.css';
import NavBar from '../components/navbar';
import Sidebar from '../components/sidebar';
import ScreenContainer from '../components/screencontainer';
import WebRTC from '../webrtc';

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

function Home(props) {
    console.log('------------------Home:')
    const [width, height] = useWindowSize();
    const dispatch = useDispatch();
    useEffect(() => {
        const query = qs.parse(props.location.search);
        console.log('----------------query:', query)
        console.log('----------------WebRTC.getInstance():', WebRTC.getInstance())
        WebRTC.getInstance().startRoom(dispatch, query.token, query.room, query.username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <table id='mainLayout' style={{width:width, height:height}}>
                <tbody>
                    <tr>
                        <td style={{width: '100%'}}>
                            <NavBar />
                            <ScreenContainer />
                        </td>
                        <td>
                            <Sidebar />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
export default Home;
