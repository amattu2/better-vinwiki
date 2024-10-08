import { useState } from "react";
import { OBDii } from "../config/OBDii";

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

export type TroubleCodeLookupResponse = [LookupStatus, { description: string | null }];

/**
 * A hook to lookup an OBD-ii code and return details on it
 *
 * NOTE: This is prep for a future network-based lookup feature.
 *
 * @param {string} code OBD-ii code to lookup
 * @returns {TroubleCodeLookupResponse}
 */
const useTroubleCodeLookup = (code: string): TroubleCodeLookupResponse => {
  const description: string | null = OBDii[code] || null;
  const [status] = useState<LookupStatus>(description ? LookupStatus.Success : LookupStatus.Error);

  return [status, { description }];
};

export default useTroubleCodeLookup;
