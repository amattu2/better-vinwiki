import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { CacheKeys } from "../config/Cache";

export type RecallEvent = {
  /**
   * The component tree describing the affected part of the vehicle
   * colon-separated, with the most general description first
   *
   * @example "STEERING:WHEEL AND HANDLE BAR"
   */
  Component: string;
  /**
   * A description of the defect failure
   *
   * @example "ON CERTAIN MOTORCYCLES, THE HANDLEBAR CLAMP BOLTS CAN LOOSEN AND CAUSE THE HANDLEBAR TO SLIP IN THE CLAMPS."
   */
  Consequence: string;
  /**
   * The NHTSA.gov campaign number
   *
   * @example "01V253000"
   */
  NHTSACampaignNumber: string;
  /**
   * General notes about the recall
   */
  Notes: string;
  /**
   * The description of the recall remedy
   */
  Remedy: string;
  /**
   * A date string describing when the recall was reported
   *
   * @example "24/09/2020"
   */
  ReportReceivedDate: string;
  /**
   * A high level summary of the recall issue
   */
  Summary: string;
} & Record<string, string>;

type Cache = Record<string, RecallEvent[]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

const getCacheKey = (year: Vehicle["year"], make: Vehicle["make"], model: Vehicle["model"]) => `${year}-${make}-${model}`;

/**
 * A hook to cache and perform a recall lookup by Year, Make, and Model
 *
 * @param year the year of the vehicle
 * @param make the make of the vehicle
 * @param model the model of the vehicle
 * @returns [status, RecallEvent[]]
 */
const useRecallLookup = (year: Vehicle["year"], make: Vehicle["make"], model: Vehicle["model"]): [LookupStatus, RecallEvent[] | null] => {
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.VEHICLE_RECALLS, {});
  const cacheKey = getCacheKey(year, make, model);
  const cachedValue: RecallEvent[] | null = cache[cacheKey] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue !== null ? LookupStatus.Success : LookupStatus.Loading);
  const [data, setData] = useState<RecallEvent[] | null>(cachedValue);

  useEffect(() => {
    if (cachedValue !== null) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${make}&model=${model}&modelYear=${year}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { Count, results } = await response?.json() || {};
      if (Count > 0 && results?.length > 0) {
        setCache((prev) => ({ ...prev, [cacheKey]: results }));
        setStatus(LookupStatus.Success);
        setData(results);
      } else if (Count === 0) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, [year, make, model]);

  return [status, data];
};

export default useRecallLookup;
