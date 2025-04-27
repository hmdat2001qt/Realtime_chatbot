// Helper function to parse cookies
export const parseCookies = (cookieString) => {
    return cookieString.split(";").reduce((cookies, cookie) => {
      const [key, value] = cookie.split("=").map((part) => part.trim());
      cookies[key] = decodeURIComponent(value || "");
      return cookies;
    }, {});
  }