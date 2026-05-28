import React, { useState } from 'react';
import './RegisterPage.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/authContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, authLoading } = useAuthContext();
    const [formData, setFormData] = useState({ name: '', username: '', email: '', avatar: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        try{
            await register(formData);
            setSuccessMsg('Registration successful');
            navigate('/dashboard');
        } catch(err){
            setErrorMsg(err?.response?.data?.message || 'Unable to register');
        }
    }

    return (
        <section className="register-page auth-page bg-light-blue">
            <div className="container py-7">
                <div className="auth-card">
                    <p className="eyebrow font-rubik">Join the community</p>
                    <h1>Create your account</h1>
                    {errorMsg && <p role="alert" className="form-error">{errorMsg}</p>}
                    {successMsg && <p role="status" className="form-text">{successMsg}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-elem"><label htmlFor="name">Name</label><input id="name" name="name" value={formData.name} onChange={handleChange} /></div>
                        <div className="form-elem"><label htmlFor="register-username">Username</label><input id="register-username" name="username" value={formData.username} onChange={handleChange} required /></div>
                        <div className="form-elem"><label htmlFor="email">Email</label><input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                        <div className="form-elem"><label htmlFor="avatar">Photo URL</label><input id="avatar" type="url" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://example.com/me.jpg" /></div>
                        <div className="form-elem"><label htmlFor="register-password">Password</label><input id="register-password" type="password" name="password" value={formData.password} onChange={handleChange} required /></div>
                        <button disabled={authLoading}>{authLoading ? 'Registering...' : 'Register'}</button>
                    </form>
                    <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
                </div>
            </div>
        </section>
    )
}

export default RegisterPage;
