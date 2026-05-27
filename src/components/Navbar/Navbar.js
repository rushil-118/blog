import React from 'react';
import "./Navbar.scss";
import { Link, NavLink } from 'react-router-dom';
import {GiPapers} from "react-icons/gi";
import {FaBars} from "react-icons/fa";
import { useSidebarContext } from '../../context/sidebarContext';
import { useAuthContext } from '../../context/authContext';

const Navbar = () => {
    const {openSidebar} = useSidebarContext();
    const { isAuthenticated, user, logout } = useAuthContext();

  return (
    <nav className='navbar bg-purple flex align-center'>
        <div className='container w-100'>
            <div className='navbar-content flex align-center justify-between'>
                <Link to = "/" className='navbar-brand text-white flex align-center fs-26'>
                    <span className='navbar-brand-icon'><GiPapers /></span>
                    <span className='navbar-brand-txt font-rubik fw-5'>Blog.</span>
                </Link>
                <div className='navbar-row flex align-center'>
                    <ul className = "navbar-nav flex align-center font-rubik">
                        <li className='nav-item'><NavLink to = "/" className='nav-link text-white fw-4 fs-18'>Home</NavLink></li>
                        {isAuthenticated && <li className='nav-item'><NavLink to = "/dashboard" className='nav-link text-white fw-4 fs-18'>Dashboard</NavLink></li>}
                        {isAuthenticated && <li className='nav-item'><NavLink to = "/posts/new" className='nav-link text-white fw-4 fs-18'>Create post</NavLink></li>}
                    </ul>
                    <div className='navbar-auth flex align-center font-rubik'>
                        {isAuthenticated ? (
                            <>
                                <span className="navbar-user text-white">{user?.name || user?.username}</span>
                                <button type="button" className="nav-auth-btn" onClick={logout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link className="nav-auth-link text-white" to="/login">Login</Link>
                                <Link className="nav-auth-btn" to="/register">Register</Link>
                            </>
                        )}
                    </div>
                    <button type = "button" aria-label="Open menu" className='sidebar-show-btn bg-white flex align-center justify-center' onClick={() => openSidebar()}>
                        <FaBars size = {21} />
                    </button>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navbar;
