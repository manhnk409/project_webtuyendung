import React, { useState } from 'react';
import { login } from '../services/api';
import './Login.css';

export default function Login({ onLogin, onNavigate }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await login({ username: form.username, password: form.password });
      // expected res: { token, user }
      if (res && res.token) {
        // persist auth
        const auth = { token: res.token, user: res.user };
        localStorage.setItem('auth', JSON.stringify(auth));
        onLogin && onLogin(auth);
      } else {
        setStatus({ type: 'error', message: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Lỗi: ' + (err.message || err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Web Tuyển Dụng</h1>
          <p>Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={form.username}
              onChange={onChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={onChange}
              disabled={isLoading}
              required
            />
          </div>

          {status && (
            <div className={`alert alert-${status.type}`}>
              {status.message}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          <p>Chưa có tài khoản? <button type="button" className="link-button" onClick={() => onNavigate && onNavigate('register')}>Đăng ký tại đây</button></p>
        </div>
      </div>
    </div>
  );
}
