import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signupform.css";

function SignupForm({ signup }) {
  const INITIAL_STATE = {
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: ""
  };

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [formErrors, setFormErrors] = useState([]);
  const navigate = useNavigate();

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      await signup(formData);             // calls App.signup -> sets token
      setFormErrors([]);
      navigate("/shelters");             // optional success redirect
    } catch (errs) {
      // errs is an array from your api helper
      setFormErrors(errs);
    }
  }

  return (
    <div className="SignupForm">
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>

        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
        />

        <input
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />

        {formErrors.length > 0 && (
          <div className="form-errors">
            {formErrors.map((err, idx) => (
              <p key={idx} style={{ color: "red" }}>{err}</p>
            ))}
          </div>
        )}

        <button className="SignupBtn" type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupForm;










