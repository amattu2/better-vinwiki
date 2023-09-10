/**
 * General Vehicle Description Formatter
 *
 * @param {Vehicle | PlateDecodeResponse} vehicle
 * @returns Formatted Vehicle String
 */
export const formatVehicleName = ({ year, make, model }: Vehicle | PlateDecodeResponse) => {
  let result = "";

  if (year && year.toString().length === 4) {
    result += `${year} `;
  }
  if (make) {
    const formattedMake = make.length <= 3 ? make.toUpperCase() : make;
    result += `${formattedMake} `;
  }
  if (model) {
    result += `${model} `;
  }

  return result.replace(/\s+$/, "");
};

export const sortVehicles = (vehicles: Vehicle[]) => vehicles.sort((a, b) => a.long_name.localeCompare(b.long_name));

export const formatOdometer = (mileage: number) => (new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(mileage)) || 0;
