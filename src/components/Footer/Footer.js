import React from 'react';
import './Footer.scss';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/authContext';

const Footer = () => {
  const { isAuthenticated } = useAuthContext();
  return (
    <footer className='footer py-5 bg-purple'>
        <div className='container'>
            <div className='footer-content text-white'>
                <div>
                  <h2 className="font-rubik">Blog.</h2>
                  <p>Full-stack stories, practical ideas, and community conversations.</p>
                </div>
                <nav className="footer-links" aria-label="Footer navigation">
                  <Link to="/">Home</Link>
                  {isAuthenticated ? <Link to="/dashboard">Dashboard</Link> : <Link to="/login">Login</Link>}
                  {isAuthenticated ? <Link to="/posts/new">Create post</Link> : <Link to="/register">Register</Link>}
                </nav>
            </div>
            <p className='copyright-text font-rubik fw-4 ls-1 text-white'>©2024 Blog. All rights reserved.</p>
        </div>
    </footer>
  )
}

export default Footer;
