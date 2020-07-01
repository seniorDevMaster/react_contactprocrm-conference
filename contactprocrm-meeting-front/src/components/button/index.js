import React, {useState} from 'react';
import './index.css';

const Button = (props) => {
    const [down, setDown] = useState(false);
    const toggleStatus = () => {
        if(props.onClick && props.status !== 'no')
            props.onClick();
    }
    return (
        <div style={{marginTop: down?2:0, paddingBottom: down?0:2 }}>
            <img className="button" src={props[props.status]} alt={props.alt} title={props.alt} height={props.height? props.height:'30px'} onClick={ toggleStatus } onMouseDown={()=>{setDown(true)}} onMouseUp={()=>{setDown(false)}} onMouseLeave={ ()=>{setDown(false)}}></img>
        </div>
    );
}
export default Button;