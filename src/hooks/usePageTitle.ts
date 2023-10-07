import { useEffect } from "react";
import { CONFIG } from "../config/AppConfig";

/**
 * Exposes a hook to set and restore the page title
 *
 * @param title The new title to set
 * @param [suffix] Include the application name suffix
 * @param [restore] Restore the title on unmount
 */
const usePageTitle = (title: string, suffix: boolean = true, restore: boolean = true): void => {
  // Update title on mount
  useEffect(() => {
    document.title = suffix ? `${title} - ${CONFIG.name}` : title;
  }, [title]);

  // Revert on unmount if requested
  useEffect(() => {
    if (!restore) {
      return () => {};
    }

    return () => document.title = CONFIG.name;
  }, []);
};

export default usePageTitle;
