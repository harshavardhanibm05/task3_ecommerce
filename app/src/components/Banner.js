import React from 'react';
import WaterWave from 'react-water-wave';
import Navbar from './Navbar'; // 1. Import your Navbar here
import './css/Banner.css'; 

function Banner() {
  return (
    <div className="banner-wrapper">
      <WaterWave
        imageUrl="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
        dropRadius={20}
        perturbance={0.03}
        resolution={512}
        style={{ 
          width: '100%', 
          height: '500px', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {() => (
          // 2. Wrap everything in a layout container
          <div className="banner-layout">
            
            {/* 3. Place the Navbar at the very top */}
            <Navbar />
            
            {/* 4. Keep your content centered below it */}
            <div className="banner-content">
              <h1>Next-Gen Tech, Delivered to Your Door!</h1>
              <p>Click. Shop. Smile.</p>
              <a href="#page-container" className="banner-btn">Shop Now</a>
            </div>
            
          </div>
        )}
      </WaterWave>
    </div>
  );
}

export default Banner;