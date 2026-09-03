import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/signin' : '/api/signup';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate(redirectTo);
        } else {
          alert("Account created! Please sign in.");
          setIsLogin(true); 
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        
        {/* 2. Add the Back to Home Link */}
        <div className="auth-back-container">
          <Link to="/" className="auth-back-link">
            ← Back to Home
          </Link>
        </div>

        <h2 className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-row">
              <input className="auth-input" type="text" placeholder="First Name" required onChange={e => setFormData({...formData, first_name: e.target.value})} />
              <input className="auth-input" type="text" placeholder="Last Name" required onChange={e => setFormData({...formData, last_name: e.target.value})} />
            </div>
          )}
          {!isLogin && (
            <input className="auth-input" type="tel" placeholder="Phone Number (Optional)" onChange={e => setFormData({...formData, phone: e.target.value})} />
          )}
          
          <input className="auth-input" type="email" placeholder="Email Address" required onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className="auth-input" type="password" placeholder="Password" required onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <button onClick={() => setIsLogin(!isLogin)} type="button" className="auth-toggle-btn">
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;