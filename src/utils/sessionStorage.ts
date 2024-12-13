export const getSessionStorage = () => {
  if (typeof window !== 'undefined') {
    return window.sessionStorage;
  }
  return null;
}

export const getAccessToken = () => {
	const sessionStorage = getSessionStorage();
	if (sessionStorage) return sessionStorage.getItem("accessToken") || "";
	return "";
};
