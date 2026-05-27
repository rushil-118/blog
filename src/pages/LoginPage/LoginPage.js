import React, {useState} from 'react';
import "./LoginPage.scss";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/authContext';

const LoginPage = () => {
    const { login, authLoading } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [loginData, setLoginData] = useState({
        username: "",
        password: "" 
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const formDataHandler = (event, property) => {
        setLoginData({
            ...loginData,
            [property]: event.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        try{
            await login({ username: loginData.username, password: loginData.password });
            setLoginData({ username: "", password: "" });
            setSuccessMsg('Login successful');
            const redirectTo = location.state?.from?.pathname;
            if(redirectTo){
                navigate(redirectTo, { replace: true });
            }
        } catch(err){
            setErrorMsg(err?.response?.data?.message || 'Unable to log in');
        }
    }

    return (
        <section className = "login">
            <div className = "container">
                <div className='login-content'>
                    <div className='section-title'>
                        <h3>Login Here!</h3>
                    </div>
                    {errorMsg && <p role="alert" className="form-text">{errorMsg}</p>}
                    {successMsg && <p role="status" className="form-text">{successMsg}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className='form-elem'>
                            <label htmlFor='username'>Username:</label>
                            <input type = "text" id = "username" name="username" onChange = {(e) => formDataHandler(e, "username")} value = {loginData.username} required />
                            <span className='form-text'>Enter your username or email.</span>
                        </div>

                        <div className='form-elem'>
                            <label htmlFor='password'>Password:</label>
                            <input type = "password" id = "password" name="password" onChange={(e) => formDataHandler(e, "password")} value = {loginData.password} required />
                            <span className='form-text'>Enter your password.</span>
                        </div>
                        <button disabled={authLoading}>{authLoading ? 'Logging in...' : 'Login'}</button>
                    </form>
                    <p className="form-text">Need an account? <Link to="/register">Register</Link></p>
                </div>
            </div>
        </section>
    )
}

export default LoginPage
