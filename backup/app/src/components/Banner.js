import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar'; 
import './css/Banner.css'; 

// 1. Only import jQuery at the top
import $ from 'jquery';

function Banner() {
  const bannerRef = useRef(null);

  useEffect(() => {
    // 2. Bind jQuery to the global window object
    window.$ = window.jQuery = $;
    
    // 3. Require the ripples plugin AFTER jQuery is bound
    require('jquery.ripples');

    if (bannerRef.current) {
      $(bannerRef.current).ripples({
        resolution: 512,
        dropRadius: 20,
        perturbance: 0.04,
        interactive: true
      });
    }

    return () => {
      if (bannerRef.current) {
        // Safe cleanup check
        try {
          $(bannerRef.current).ripples('destroy');
        } catch (e) {
          // Ignore cleanup errors on unmount
        }
      }
    };
  }, []);

  return (
    <div className="banner-wrapper">
      <div ref={bannerRef} className="banner-background">
        <div className="banner-layout">
          <Navbar />
          
          <div className="banner-content">
            <h1>Next-Gen Tech, Delivered to Your Door!</h1>
            <p>Click. Shop. Smile.</p>
            <a href="#page-container" className="banner-btn">Shop Now</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;