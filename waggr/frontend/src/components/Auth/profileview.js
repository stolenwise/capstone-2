import { Link } from "react-router-dom";
import "./profileview.css";

export default function ProfileView({ currentUser }) {
  const { username, firstName, lastName, email } = currentUser || {};

  return (
    <div className="ProfileViewPage">
      <h3>Your Profile</h3>

      <div className="ProfileCard">
        <div className="row"><span className="label">Username</span><span>{username}</span></div>
        <div className="row"><span className="label">First Name</span><span>{firstName}</span></div>
        <div className="row"><span className="label">Last Name</span><span>{lastName}</span></div>
        <div className="row"><span className="label">Email</span><span>{email}</span></div>
      </div>

      <Link to="/edit-profile" className="EditProfileBtn">Edit Profile</Link>
    </div>
  );
}
