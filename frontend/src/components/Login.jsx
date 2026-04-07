import { useState } from 'react';
import axios from 'axios';

function Login({ setToken, setUserId, setUsername }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsernameLocal] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';
    try {
      const res = await axios.post(url, { username, password });
      if (isLogin) {
        setToken(res.data.token);
        setUserId(res.data.userId);
        setUsername(res.data.username);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('username', res.data.username);
      } else {
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsernameLocal(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

export default Login;