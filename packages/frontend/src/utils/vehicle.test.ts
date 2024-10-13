import * as utils from "./vehicle";
import { DEFAULT_VEHICLE_SRC } from "../config/Endpoints";

describe("buildPlaceholderVehicle", () => {
  it("should return a vehicle with default values", () => {
    const vehicle = utils.buildPlaceholderVehicle();
    expect(vehicle.long_name).toBe("-");
    expect(vehicle.make).toBe("-");
    expect(vehicle.model).toBe("-");
    expect(vehicle.trim).toBe("-");
    expect(vehicle.vin).toBe("-");
    expect(vehicle.year).toBe("-");
  });

  it("should return a vehicle with custom values", () => {
    const vehicle = utils.buildPlaceholderVehicle("", "fill");
    expect(vehicle.long_name).toBe("fill");
    expect(vehicle.make).toBe("fill");
    expect(vehicle.model).toBe("fill");
    expect(vehicle.trim).toBe("fill");
    expect(vehicle.vin).toBe("fill");
    expect(vehicle.year).toBe("fill");
  });

  it("should return a vehicle with the placeholder photo URL", () => {
    const vehicle = utils.buildPlaceholderVehicle();
    expect(vehicle.icon_photo).toBe(DEFAULT_VEHICLE_SRC);
  });

  it("should return a vehicle with the placeholder VIN", () => {
    const vehicle = utils.buildPlaceholderVehicle("1FAFP4045XF127663");
    expect(vehicle.vin).toBe("1FAFP4045XF127663");
  });
});

describe("formatVehicleName", () => {
  it("should format a vehicle with all proper fields", () => {
    const formatted = utils.formatVehicleName({
      year: "2023",
      make: "Nissan",
      model: "Maxima",
    } as Vehicle);
    expect(formatted).toBe("2023 Nissan Maxima");
  });

  it.each<Pick<Vehicle, "year" | "make" | "model"> & { expected: string }>([
    { year: "2017", make: "Toyota", model: "Supra", expected: "2017 Toyota Supra" },
    { year: "2015  ", make: "Mercedes-Benz", model: "C300", expected: "2015 Mercedes-Benz C300" },
    { year: "    ", make: "Honda", model: "Civic", expected: "Honda Civic" },
    { year: "", make: "Lexus", model: "LC500", expected: "Lexus LC500" },
    { year: null, make: "Mazda", model: "CX-5", expected: "Mazda CX-5" },
  ])("should include the year '$year' if it is valid", ({ expected, ...vehicle }) => {
    const formatted = utils.formatVehicleName(vehicle as Vehicle);
    expect(formatted).toBe(expected);
  });

  it("should include the make only if it is provided", () => {
    const formatted = utils.formatVehicleName({
      year: "2003",
      make: "",
      model: "330i",
    } as Vehicle);
    expect(formatted).toBe("2003 330i");
  });

  it("should include the model only if it is provided", () => {
    const formatted = utils.formatVehicleName({
      year: "2003",
      make: "BMW",
      model: "",
    } as Vehicle);
    expect(formatted).toBe("2003 BMW");
  });

  it("should capitalize the make if it is less than 4 characters", () => {
    const formatted = utils.formatVehicleName({
      year: "2013",
      make: "Bmw",
      model: "M3",
    } as Vehicle);
    expect(formatted).toBe("2013 BMW M3");
  });

  it("should return 'Unknown Vehicle' if no vehicle is provided", () => {
    const formatted = utils.formatVehicleName({} as Vehicle);
    expect(formatted).toBe("Unknown Vehicle");
  });

  it("should trim extra whitespace from the formatted string", () => {
    const formatted = utils.formatVehicleName({
      year: "2000  ",
      make: "  Ford",
      model: "Focus  ",
    } as Vehicle);
    expect(formatted).toBe("2000 Ford Focus");
  });
});

describe("sortVehicles", () => {
  it("should sort vehicles in ascending order by long_name", () => {
    const vehicles = [{ long_name: "C" }, { long_name: "A" }, { long_name: "B" }] as Vehicle[];

    expect(utils.sortVehicles(vehicles)).toEqual([
      { long_name: "A" },
      { long_name: "B" },
      { long_name: "C" },
    ]);
  });

  it("should handle vehicles without a long_name", () => {
    const vehicles = [{ long_name: "C" }, { long_name: "A" }, {}] as Vehicle[];

    expect(utils.sortVehicles(vehicles)).toEqual([{}, { long_name: "A" }, { long_name: "C" }]);
  });

  it("should handle invalid data without crashing", () => {
    expect(utils.sortVehicles(null as unknown as Vehicle[])).toEqual([]);
    expect(utils.sortVehicles(undefined as unknown as Vehicle[])).toEqual([]);
    expect(utils.sortVehicles([])).toEqual([]);
  });

  it("should not mutate the original array", () => {
    const vehicles = [{ long_name: "C" }, { long_name: "A" }, { long_name: "B" }] as Vehicle[];
    const sorted = utils.sortVehicles(vehicles);

    expect(vehicles).toEqual([{ long_name: "C" }, { long_name: "A" }, { long_name: "B" }]);
    expect(sorted).toEqual([{ long_name: "A" }, { long_name: "B" }, { long_name: "C" }]);
  });
});

describe("formatOdometer", () => {
  it("should format an odometer reading in the en-US locale by default", () => {
    const formatted = utils.formatOdometer(57256);
    expect(formatted).toBe("57,256");
  });

  it.each<{ locale: Intl.LocalesArgument; input: number; expected: string }>([
    { locale: "de-DE", input: 50222, expected: "50.222" },
    { locale: "fr-FR", input: 79393, expected: "79 393" },
    { locale: "en-US", input: 125675, expected: "125,675" },
    { locale: "en-GB", input: 125675, expected: "125,675" },
  ])(
    "should use the locale $locale to format the odometer reading as $expected",
    ({ locale, input, expected }) => {
      const formatted = utils.formatOdometer(input, locale);
      expect(formatted).toBe(expected);
    }
  );

  it("should return an empty string if the odometer is not a number", () => {
    expect(utils.formatOdometer("" as unknown as number)).toBe("");
    expect(utils.formatOdometer({} as unknown as number)).toBe("");
    expect(utils.formatOdometer(null as unknown as number)).toBe("");
  });
});

describe("validateVIN", () => {
  it("should return false for a VIN that is too short", () => {
    expect(utils.validateVIN("1GNEK13Z22R29898")).toBe(false);
  });

  it("should return false for a VIN that is too long", () => {
    expect(utils.validateVIN("1GNEK13Z22R2989841")).toBe(false);
  });

  it("should return false for a VIN that contains invalid characters", () => {
    expect(utils.validateVIN("1GNEK13Z22R29898O")).toBe(false);
  });

  it.each<[boolean, string]>([
    [false, ""],
    [false, "5016964"],
    [false, "OOOOOOOOOOOOOOOOO"],
    [true, "5NPDH4AE3DH192857"],
    [true, "2G1WG5E3XC1212069"],
    [true, "1J4GK58K92W219075"],
    [true, "5UXWX9C55E0D39153"],
    [true, "1GNEK13Z22R298984"],
    [true, "WDB9071351N007450"],
    [true, "1ZVBP8EM2E5263449"],
    [true, "WBAFG61020LT72216"],
    [true, "JMZNA18B201131813"],
    [true, "1FACP42D8PF143209"],
    [true, "WUAZZZF11PD004324"],
  ])("should return '%p' for the VIN %p", (expected, vin) => {
    expect(utils.validateVIN(vin)).toBe(expected);
  });
});
