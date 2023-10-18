/**
 * The strict type definition for the Application configuration
 */
type AppConfig = {
  /**
   * The name of the application
   *
   * Used by:
   * - Page titles
   * - Auth page banners
   * - etc
   */
  name: string;
  /**
   * The deployed URL of the application
   *
   * Used by:
   * - *Nothing yet*
   */
  url: string;
  /**
   * The HTML meta description of the application
   *
   * Used by:
   * - *Nothing yet*
   */
  description: string;
  /**
   * The slogan of the application
   *
   * Visible under the name in the header.
   */
  slogan: string;
  /**
   * The base URL for the API server
   *
   * NOTE: Should end with a trailing slash
   */
  API_URL: string;
  /**
   * The base URL for the media API server
   *
   * NOTE: Should end with a trailing slash
   */
  MEDIA_API_URL: string;
  /**
   * The base URL for the media CDN server
   */
  MEDIA_CDN_URL: string;
  /**
   * The name of the client passed in the `client` property of
   * a new Feed Post
   */
  API_CLIENT: string;
  /**
   * The base URL of the React application
   *
   * Defaults to empty string.
   *
   * @default ""
   * @example /subdirectory
   */
  PUBLIC_URL: string;
};
