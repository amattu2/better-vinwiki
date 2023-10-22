import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, CircularProgress, Stack, TextField, Typography, debounce } from "@mui/material";
import { isValidVin } from "@shaggytools/nhtsa-api-wrapper";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { buildPlaceholderVehicle, formatVehicleName } from "../../utils/vehicle";
import useFollowingVehiclesLookup from "../../hooks/useFollowingVehiclesLookup";

type Props = {
  value?: Vehicle | null;
  onChange: (e: React.SyntheticEvent, value: Vehicle | null, reason: string) => void;
};

const fetchVehicles = async (searchValue: string, token: string, signal: AbortSignal): Promise<Vehicle[]> => {
  if (!searchValue || searchValue.length < 3) {
    return [];
  }

  const response = await fetch(ENDPOINTS.vehicle_search, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: searchValue }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};
  const { vehicles } = results || {};

  return status === STATUS_OK && vehicles?.length ? vehicles : [];
};

const fetchVehicle = async (vin: string, token: string, signal: AbortSignal): Promise<Vehicle | null> => {
  const response = await fetch(ENDPOINTS.vehicle + vin, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  }).catch(() => null);

  const { status, vehicle } = await response?.json() || {};
  if (status === STATUS_OK && vehicle?.vin) {
    return vehicle;
  }

  return null;
};

/**
 * A autocomplete/typeahead search component for Vehicles
 * that handles debouncing and fetching results from the API
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const VehicleSearch: FC<Props> = ({ value, onChange }: Props) => {
  const { token, profile } = useAuthProvider();
  const [, { vehicles: recentVehicles }] = useFollowingVehiclesLookup(profile!.uuid);

  const [searchValue, setSearchValue] = useState<string>("");
  const [options, setOptions] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedOptions = useMemo(() => {
    const cloned = [...options, value].filter((v: Vehicle | null | undefined) => v) as Vehicle[];
    cloned.sort((a: Vehicle, b: Vehicle) => (b?.make || "").localeCompare(a?.make || ""));

    recentVehicles?.forEach((v: Vehicle) => {
      if (cloned.find((c: Vehicle) => c.vin === v.vin)) {
        return;
      }

      cloned.unshift(v);
    });

    return cloned;
  }, [options, recentVehicles, value]);

  const onInputChange = (event: React.SyntheticEvent, value: string, reason: string) => {
    if (value.length < 3) {
      return;
    }
    if (reason !== "input") {
      return;
    }

    setSearchValue(value);
  };

  const onChangeWrapper = (e: React.SyntheticEvent, value: Vehicle | null, reason: string) => {
    inputRef.current?.blur();
    setSearchValue("");
    onChange(e, value, reason);
  };

  const debouncedSearch = useMemo(() => debounce(onInputChange, 200), []);

  useEffect(() => {
    if (!token || !searchValue || searchValue.length < 3) {
      return () => {};
    }

    const searchController = new AbortController();
    const decodeController = new AbortController();

    setLoading(true);

    (async () => {
      const vehicles = await fetchVehicles(searchValue, token, searchController.signal);
      if (searchController.signal.aborted) {
        return;
      }
      setLoading(false);

      // Results were found or the VIN is invalid
      if (vehicles.length || !isValidVin(searchValue)) {
        setOptions(vehicles);
        return;
      }

      // VIN is valid, but no results were found. Try to fetch the vehicle directly.
      setOptions([buildPlaceholderVehicle(searchValue, "Decoding")]);
      const vehicle = await fetchVehicle(searchValue, token, decodeController.signal);
      if (vehicle) {
        setOptions([vehicle]);
      }
    })();

    return () => {
      searchController.abort();
      decodeController.abort();
    };
  }, [searchValue]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      autoComplete
      value={value}
      loading={loading}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={mergedOptions}
      groupBy={(option: Vehicle) => (
        recentVehicles?.find((v) => v.vin === option.vin) ? "Recents & Following" : (option.make || "Unknown").toUpperCase()
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          label="Search by VIN or Description"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      getOptionLabel={(option: Vehicle) => option.vin}
      onInputChange={debouncedSearch}
      renderOption={(props, option: Vehicle) => (
        <li {...props} key={option.vin}>
          <Stack direction="column">
            <Typography variant="body2">{formatVehicleName(option)}</Typography>
            <Typography variant="caption" color="textSecondary">{option.vin}</Typography>
          </Stack>
        </li>
      )}
      isOptionEqualToValue={(option: Vehicle, value: Vehicle) => option.vin === value.vin}
      noOptionsText="No vehicles found"
      filterOptions={(v) => v}
      onChange={onChangeWrapper}
      sx={{ width: 300 }}
      size="small"
    />
  );
};

export default VehicleSearch;
