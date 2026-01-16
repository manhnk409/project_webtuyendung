import React, { useState } from 'react';
import { register } from '../services/api';
import './Register.css';

export default function Register({ onNavigate }) {
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'candidate' });
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await register({ username: form.username, password: form.password, email: form.email, role: form.role });
      if (res && res.success) {
        setStatus({ type: 'success', message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
        setForm({ username: '', password: '', email: '', role: 'candidate' });
        setTimeout(() => {
          onNavigate && onNavigate('login');
        }, 2000);
      } else {
        setStatus({ type: 'error', message: res?.message || 'Đăng ký thất bại. Vui lòng thử lại.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Lỗi: ' + (err.message || err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>Web Tuyển Dụng</h1>
          <p>Tạo tài khoản mới</p>
        </div>

        <form onSubmit={onSubmit} className="register-form">
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={form.email}
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
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={form.password}
              onChange={onChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Đăng ký như:</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={onChange}
              disabled={isLoading}
              required
            >
              <option value="candidate">Ứng Viên</option>
              <option value="employer">Nhà Tuyển Dụng</option>
            </select>
          </div>

          {status && (
            <div className={`alert alert-${status.type}`}>
              {status.message}
            </div>
          )}

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="register-footer">
          <p>Đã có tài khoản? <button type="button" className="link-button" onClick={() => onNavigate && onNavigate('login')}>Đăng nhập ngay</button></p>
        </div>
      </div>
    </div>
  );
}
