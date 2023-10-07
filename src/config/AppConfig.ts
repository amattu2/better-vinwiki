export const CONFIG: AppConfig = {
  name: process.env.REACT_APP_NAME || "React App",
  slogan: process.env.REACT_APP_SLOGAN || "",
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:8080/",
  MEDIA_API_URL: process.env.REACT_APP_MEDIA_API_URL || "http://localhost:8081/",
  MEDIA_CDN_URL: process.env.REACT_APP_MEDIA_CDN_URL || "http://localhost:8082/",
};
