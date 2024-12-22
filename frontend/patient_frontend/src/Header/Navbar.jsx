import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {assets} from '../assets/assets'

const Navbar = () => {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false)
  const [token,setToken] = useState(true)
  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
      <img className='w-44 cursor-pointer' src={assets.logo} alt="Snow"  />
      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to='/'>
            <li className='py-1'>Home</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/patient/All-Doctors'>
            <li className='py-1'>All Doctors</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/patient/About'>
            <li className='py-1'>About</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/patient/Contact'>
            <li className='py-1'>Contact</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
        </NavLink>
        
      </ul>
      <div className='flex items-center'>
        {
          token
          ? <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 rounded-full' src={assets.profile_pic} alt='profile_pic'/>
            <img className='w-2.5' src = {assets.dropdown_icon} alt='notification' />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                <p onClick={()=>navigate('patient/Profile')}className='hover:text-black cursor-pointer'>My Profile</p>
                <p onClick={()=>navigate('patient/my-appointments')}className='hover:text-black cursor-pointer'>My Appointments</p>
                <p onClick={()=>setToken(false)}className='hover:text-black cursor-pointer'>Logout</p>
              </div>
            </div>

            
            
          </div>
          :<button onClick={()=> navigate('/patient/signin')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Create Account</button>
        }
        
      </div>
    
    
    </div>
  )
}

export default Navbar