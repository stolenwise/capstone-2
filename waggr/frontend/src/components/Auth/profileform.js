import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./profileform.css";

export default function ProfileForm({ currentUser, updateProfile }) {
const navigate = useNavigate();

  const INITIAL = {
    firstName: currentUser.firstName || "",
    lastName:  currentUser.lastName  || "",
    email:     currentUser.email     || "",
    password: "" // current password required to confirm changes
  };
  const [formData, setFormData] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    setSaved(false);

    // send only the fields the API expects
    const payload = {
      firstName: formData.firstName,
      lastName:  formData.lastName,
      email:     formData.email,
      password:  formData.password,
    };

    const res = await updateProfile(payload);
    setSaving(false);

    if (res.success) {
      setFormData(f => ({ ...f, password: "" }));
      setSaved(true);
      navigate("/profile", { replace: true });
    } else {
      setErrors(res.errs || ["Unable to save profile."]);
    }
  }




  return (
    <div className="ProfilePage">
      <h3>Edit Profile</h3>
      <form className="ProfileForm" onSubmit={handleSubmit}>
        <label>Username</label>
        <input value={currentUser.username} disabled />

        <label>First Name</label>
        <input name="firstName" value={formData.firstName} onChange={handleChange} />

        <label>Last Name</label>
        <input name="lastName" value={formData.lastName} onChange={handleChange} />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />

        <label>Confirm with Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter current password" />

        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((e, i) => <p key={i} style={{ color: "red" }}>{e}</p>)}
          </div>
        )}

        {saved && <div className="form-saved">Profile updated!</div>}

        <button className="ProfileBtn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
