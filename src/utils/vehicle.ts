import { DEFAULT_VEHICLE_SRC } from "../config/Endpoints";
import { VinCharacterRegex } from "../config/RegEx";

/**
 * Builds a placeholder vehicle from the `Vehicle` type
 *
 * @param vin the VIN for the placeholder vehicle
 * @param fill the value to fill fields with
 * @returns Vehicle
 */
export const buildPlaceholderVehicle = (vin = "", fill = "-"): Vehicle => ({
  icon_photo: DEFAULT_VEHICLE_SRC,
  long_name: fill,
  make: fill,
  model: fill,
  trim: fill,
  vin: vin || fill,
  year: fill,
});

/**
 * General Vehicle Description Formatter
 *
 * @param {Vehicle | PlateDecodeResponse} vehicle
 * @returns Formatted Vehicle String
 */
export const formatVehicleName = ({ year, make, model }: Vehicle | PlateDecodeResponse) => {
  let result = "";

  if (year && year.toString().trim().length === 4) {
    result += `${year} `;
  }
  if (make) {
    const formattedMake = make.length <= 3 ? make.toUpperCase() : make;
    result += `${formattedMake} `;
  }
  if (model) {
    result += `${model} `;
  }

  return result.replace(/\s+/g, " ").trim() || "Unknown Vehicle";
};

/**
 * Sorts an array of vehicles by their `long_name` property
 *
 * @note Does not mutate the original array
 * @param vehicles The vehicles to sort
 * @returns The sorted array of vehicles
 */
export const sortVehicles = (vehicles: Vehicle[]) =>
  [...(vehicles || [])].sort((a, b) => (a?.long_name || "").localeCompare(b?.long_name || "")) ||
  [];

/**
 * Format a odometer reading as a string in the proper locale
 *
 * @param odometer The unformatted odometer reading
 * @param locale The locale to format the odometer in
 * @returns formatted odometer reading string
 */
export const formatOdometer = (
  odometer: number,
  locale: Intl.LocalesArgument = "en-US"
): string => {
  if (typeof odometer !== "number") {
    return "";
  }

  return odometer.toLocaleString(locale);
};

/**
 * A loosely-defined VIN validation utility
 *
 * @param vin The VIN to validate
 * @returns true if the VIN is valid, false otherwise
 */
export const validateVIN = (vin: string): boolean => {
  if (vin.length !== 17) {
    return false;
  }

  return VinCharacterRegex.test(vin);
};
