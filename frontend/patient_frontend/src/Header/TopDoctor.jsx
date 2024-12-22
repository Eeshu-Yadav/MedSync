import React from 'react'
import { doctors } from '../assets/assets'

const TopDoctor = () => {
  return (
    <div>
      <h2>Top Doctors to Book</h2>
      <p>Simply browse through our extensive list of trusted doctors.</p>
      <div>
        {doctors.slice(0,10).map((item, index) => (
          <div>
            
          </div>
          ))}
      </div>
    </div>
  )
}

export default TopDoctor