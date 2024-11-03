import { useNavigate } from "react-router-dom";
import { useFeedProvider, ProviderState as FeedProviderState } from "../Providers/FeedProvider";
/**
 * A hook to wrap the useFeedProvider hook
 *
 * Provides a removePost function that is used by the FeedPost component
 *
 * @returns {Pick<FeedProviderState, "removePost">}
 */
const usePostDeleteWrapper = (): Pick<FeedProviderState, "removePost"> => {
  const navigate = useNavigate();

  const removePost = (): boolean => {
    navigate("/");
    return true;
  };

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { removePost } = useFeedProvider();
    return { removePost };
  } catch (e) {
    return { removePost };
  }
};

export default usePostDeleteWrapper;
