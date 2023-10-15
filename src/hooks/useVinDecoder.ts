import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { DecodeVinValues, DecodeVinValuesResults, isValidVin } from "@shaggytools/nhtsa-api-wrapper";
import { CacheKeys } from "../config/Cache";
import { SkipDecodeKeys } from "../config/NHTSA";

type Cache = Record<Vehicle["vin"], DecodeVinValuesResults>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and decode VIN details
 *
 * @param vin the VIN to decode
 * @param [modelYear] the model year of the vehicle
 * @returns [status, DecodeVinValuesResults]
 */
const useVinDecoder = (vin: Vehicle["vin"], modelYear?: Vehicle["year"]): [LookupStatus, DecodeVinValuesResults | null] => {
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.VEHICLE_DECODE, {});
  const cachedValue: DecodeVinValuesResults | null = cache[vin] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue !== null ? LookupStatus.Success : LookupStatus.Loading);
  const [data, setData] = useState<DecodeVinValuesResults | null>(cachedValue);

  useEffect(() => {
    if (cachedValue !== null) {
      return;
    }
    if (!isValidVin(vin) || !vin) {
      setStatus(LookupStatus.Error);
      return;
    }

    (async () => {
      const { Count, Results } = await DecodeVinValues(vin, {
        modelYear: modelYear && parseInt(modelYear, 10) > 0 ? modelYear : undefined,
      });

      if (Count > 0 && Results?.[0]) {
        const resultKeys: (keyof DecodeVinValuesResults)[] = Object.keys(Results[0]) as (keyof DecodeVinValuesResults)[];
        const results: DecodeVinValuesResults = { ...Results[0] };
        resultKeys.forEach((key) => {
          if (!key || SkipDecodeKeys.includes(key)) {
            delete results[key];
          }
          if (!results[key] || results[key] === "Not Applicable") {
            delete results[key];
          }
        });

        setCache((prev) => ({ ...prev, [vin]: results }));
        setStatus(LookupStatus.Success);
        setData(results);
      } else {
        setStatus(LookupStatus.Error);
      }
    })();
  }, [vin]);

  return [status, data];
};

export default useVinDecoder;
