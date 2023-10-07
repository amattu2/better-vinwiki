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
};
