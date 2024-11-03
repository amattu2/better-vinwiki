import { DecodeVinValuesResults } from "@shaggytools/nhtsa-api-wrapper";

/**
 * A list of keys to filter out of the VIN decoder results
 */
export const SkipDecodeKeys: (keyof DecodeVinValuesResults)[] = [
  "ErrorCode",
  "ErrorText",
  "AdditionalErrorText",
  "VIN",
  "SuggestedVIN",
  "VehicleDescriptor",
  "DestinationMarket",
  "Note",
  "PossibleValues",
];
