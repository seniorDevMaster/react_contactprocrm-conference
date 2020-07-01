import React from 'react';
import { Fade } from 'react-slideshow-image';
import './index.css';

const fadeImages = [
    'src/images/ContactProCRM.png',
    'src/images/ContactProCRM.png',
    'src/images/ContactProCRM.png'
];
const fadeProperties = {
    duration: 5000,
    transitionDuration: 500,
    infinite: false,
    indicators: true,
    onChange: (oldIndex, newIndex) => {
        console.log(`fade transition from ${oldIndex} to ${newIndex}`);
    }
}
 
const Slideshow = () => {
    return (
      <div className="slide-container">
        <Fade {...fadeProperties}>
          <div className="each-fade">
            <div className="image-container">
              <img className='image-opacity' src={fadeImages[0]} alt='' />
            </div>
            {/* <h2>First Slide</h2> */}
          </div>
          <div className="each-fade">
            <div className="image-container">
              <img className='image-opacity' src={fadeImages[1]}  alt='' />
            </div>
            {/* <h2>Second Slide</h2> */}
          </div>
          <div className="each-fade">
            <div className="image-container">
              <img className='image-opacity' src={fadeImages[2]}  alt='' />
            </div>
            {/* <h2>Third Slide</h2> */}
          </div>
        </Fade>
      </div>
    )
}
export default Slideshow;
