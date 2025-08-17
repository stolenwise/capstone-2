import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginform.css";


function LoginForm({ login }) {
  const [form, setForm] = useState({ username: "testuser", password: "password" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(form);
      navigate("/shelters"); // start on /shelters route
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="LoginPage">
      <h3> Log In</h3>
    <form className="LoginForm" onSubmit={handleSubmit}>
      <input name="username" value={form.username} onChange={handleChange} placeholder="username" />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="password" />
      <button type="submit" className="LoginBtn">Log in</button>
      {error && <div style={{color:'red'}}>{String(error)}</div>}
    </form>
    </div>
  );
}

export default LoginForm;
