import { Navigate, Outlet } from "react-router";
import { getCachedProfile } from "./storage/profile-storage";
import { getProfile } from "./service/authService";
import { useState, useEffect } from "react";

function ProtectedRoutes() {
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [checking, setChecking] = useState(!profile);

  useEffect(() => {
    if (profile) return;

    getProfile()
      .then((profile) => { if (profile) setProfile(profile); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking)
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-karga-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!profile) return <Navigate to={"/login"} />;

  if (profile.weight === null || profile.size === null ||
      profile.time_for_week === null || profile.rest_time === null) {
    return <Navigate to={"/onboarding"} />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
