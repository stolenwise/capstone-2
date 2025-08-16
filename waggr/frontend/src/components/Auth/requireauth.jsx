import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Gate routes until we know auth status (infoLoaded),
 * then require a currentUser to access the children.
 */
function RequireAuth({ currentUser, infoLoaded }) {
  const location = useLocation();

  // while loading, don't render protected content or redirect yet
  if (!infoLoaded) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  // if not logged in, bounce to /login and remember where we were headed
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // otherwise render nested routes
  return <Outlet />;
}

export default RequireAuth;
