export const CONFIG: AppConfig = {
  name: process.env.REACT_APP_NAME || "React App",
  description: process.env.REACT_APP_DESCRIPTION || "",
  slogan: process.env.REACT_APP_SLOGAN || "",
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:8080/",
  MEDIA_API_URL: process.env.REACT_APP_MEDIA_API_URL || "http://localhost:8081/",
  MEDIA_CDN_URL: process.env.REACT_APP_MEDIA_CDN_URL || "http://localhost:8082/",
  API_CLIENT: process.env.REACT_APP_API_CLIENT || "react-app",
  PUBLIC_URL: process.env.PUBLIC_URL || "",
};
