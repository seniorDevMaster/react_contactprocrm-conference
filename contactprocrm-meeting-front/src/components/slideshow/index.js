import React from 'react';
import { Fade } from 'react-slideshow-image';
import './index.css';

/*const fadeImages = [
    '../../images/Slider-11.jpg',
    '../../images/Slider-22.jpg',
    '../../images/Slider-33.jpg'
];*/
import Slider11 from '../../images/Slider-11.jpg'
import Slider22 from '../../images/Slider-22.jpg'
import Slider33 from '../../images/Slider-33.jpg'

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
              <img className='image-opacity' src={Slider11} alt='' />
            </div>
            {/* <h2>First Slide</h2> */}
          </div>
          <div className="each-fade">
            <div className="image-container">
              <img className='image-opacity' src={Slider22}  alt='' />
            </div>
            {/* <h2>Second Slide</h2> */}
          </div>
          <div className="each-fade">
            <div className="image-container">
              <img className='image-opacity' src={Slider33}  alt='' />
            </div>
            {/* <h2>Third Slide</h2> */}
          </div>
        </Fade>
      </div>
    )
}
export default Slideshow;
