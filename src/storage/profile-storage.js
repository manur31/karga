export const getCachedProfile = () => {
    const profile = localStorage.getItem("profile");
    return profile ? JSON.parse(profile) : null;
};

export const setCachedProfile = (profile) => {
  localStorage.setItem("profile", JSON.stringify(profile));
};

export const clearCachedProfile = () => {
  localStorage.removeItem("profile");
};