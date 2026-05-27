import React from 'react';
import "./Sidebar.scss";
import {GiPapers} from "react-icons/gi";
import {FaTimes} from "react-icons/fa";
import {Link} from "react-router-dom";
import { useSidebarContext } from '../../context/sidebarContext';
import { useAuthContext } from '../../context/authContext';

const Sidebar = () => {
    const {isSidebarOpen, closeSidebar} = useSidebarContext();
    const {isAuthenticated, user, logout} = useAuthContext();

    const handleLogout = () => {
        logout();
        closeSidebar();
    }

  return (
    <div className = {`sidebar ${isSidebarOpen ? 'sidebar-open' : ""}`}>
        <button type = "button" className='sidebar-close-btn' aria-label="Close menu" onClick={() => closeSidebar()}>
            <FaTimes size = {24} className='text-white' />
        </button>
        <Link className='navbar-brand text-white flex align-center fs-26' to = "/" onClick={closeSidebar}>
            <span className='navbar-brand-icon'><GiPapers /></span>
            <span className='navbar-brand-txt font-rubik fw-5'>Blog.</span>
        </Link>
        {isAuthenticated && <p className="sidebar-user text-white">Signed in as {user?.name || user?.username}</p>}
        <ul className = "sidebar-nav font-rubik my-5">
            <li className='nav-item'><Link to = "/" onClick={closeSidebar} className='nav-link text-white fw-4 fs-18'>Home</Link></li>
            {isAuthenticated && <li className='nav-item'><Link to = "/dashboard" onClick={closeSidebar} className='nav-link text-white fw-4 fs-18'>Dashboard</Link></li>}
            {isAuthenticated && <li className='nav-item'><Link to = "/posts/new" onClick={closeSidebar} className='nav-link text-white fw-4 fs-18'>Create post</Link></li>}
            {!isAuthenticated && <li className='nav-item'><Link to = "/login" onClick={closeSidebar} className='nav-link text-white fw-4 fs-18'>Login</Link></li>}
            {!isAuthenticated && <li className='nav-item'><Link to = "/register" onClick={closeSidebar} className='nav-link text-white fw-4 fs-18'>Register</Link></li>}
        </ul>
        {isAuthenticated && <button type="button" className="sidebar-logout" onClick={handleLogout}>Logout</button>}
        <div className='sidebar-blocks my-5'>
            <div className='sidebar-block'>
                <h3 className='font-rubik text-white'>About Blog.</h3>
                <p className='text-white'>A modern place to publish, discuss, and manage full-stack blog stories.</p>
            </div>
        </div>
    </div>
  )
}

export default Sidebar;
