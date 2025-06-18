import { useState } from 'react';
import './LoginForm.css';
// Just a simple login form. Handles login requests and lets users play a demo game too.
function LoginForm({ onLogin, onDemo }) {
    // For typing username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
   // For showing messages like login errors+
  const [message, setMessage] = useState('');
   
    
  // When user hits login, send credentials to the server and check if login worked
  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const user = await response.json();
        onLogin(user);
        setMessage(`✅ Logged in as ${user.username}`);
      } else {
        const error = await response.json();
        setMessage(`❌ Login failed: ${error.error || 'Wrong credentials'}`);
      }
    } catch (err) {
      setMessage(`⚠️ Error: ${err.message}`);
    }
  };

  // UI for the login form and demo game button
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">🔐 Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <button type="submit">
            Login
          </button>
        </form>

        <div className="test-credentials">
          {/* <strong>Test Credentials for Exam Review:</strong><br /> */}
          Username: <span style={{ fontFamily: 'monospace' }}>webapplication</span><br />
          Password: <span style={{ fontFamily: 'monospace' }}>137800</span>
        </div>

        <button
          className="demo-btn"
          type="button"
          onClick={onDemo}
        >
          🕹️ Play Demo
        </button>

        {message && (
          <p style={{
            marginTop: '1rem',
            color: message.includes('✅') ? 'green' : 'red'
          }}>
            {message}
          </p>
        )}
      </div>

     
    </div>
  );
}

export default LoginForm;
