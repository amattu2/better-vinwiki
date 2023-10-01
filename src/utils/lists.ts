import { cloneDeep } from "lodash";

/**
 * Sort an array of Vehicle Lists by a given criteria
 *
 * @param lists the array of lists to sort
 * @param sortBy the criteria to sort by
 * @returns {Lists[]} a cloned and sorted array of lists
 */
export const sortLists = (lists: List[], sortBy: "alpha" | "date" | "popularity"): List[] => {
  const cloned: List[] = cloneDeep(lists);

  switch (sortBy) {
    case "date":
      cloned.sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());
      break;
    case "popularity":
      cloned.sort((a, b) => b.follower_count - a.follower_count);
      break;
    default:
      cloned.sort((a, b) => a.name.localeCompare(b.name));
  }

  return cloned;
};
