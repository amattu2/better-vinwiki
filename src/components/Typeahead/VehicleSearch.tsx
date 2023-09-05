import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, Stack, TextField, Typography, debounce } from "@mui/material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { formatVehicleName } from "../../utils/vehicle";

type Props = {
  value?: Vehicle | null;
  onChange: (e: React.SyntheticEvent, value: Vehicle | null, reason: string) => void;
};

const fetchVehicles = async (searchValue: string, token: string, controller: React.MutableRefObject<AbortController>): Promise<Vehicle[]> => {
  if (!searchValue || searchValue.length < 3) {
    return [];
  }
  if (controller.current) {
    controller.current.abort();
  }

  controller.current = new AbortController();
  const { signal } = controller!.current;

  const response = await fetch(ENDPOINTS.vehicle_search, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: searchValue }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};
  if (status === STATUS_OK && results?.vehicles) {
    return results.vehicles;
  }

  return [];
};

/**
 * A autocomplete/typeahead search component for Vehicles
 * that handles debouncing and fetching results from the API
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const VehicleSearch: FC<Props> = ({ value, onChange }: Props) => {
  const { token } = useAuthProvider();

  const [searchValue, setSearchValue] = useState<string>("");
  const [options, setOptions] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const controllerRef = useRef<AbortController>(new AbortController());

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
    setSearchValue("");
    onChange(e, value, reason);
  };

  const debouncedSearch = useMemo(() => debounce(onInputChange, 200), []);

  useEffect(() => {
    if (!searchValue || searchValue.length < 3) {
      return;
    }
    if (!token || !controllerRef.current) {
      return;
    }

    setLoading(true);
    fetchVehicles(searchValue, token, controllerRef).then((v) => {
      setOptions(v);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return (
    <Autocomplete
      autoComplete
      value={value}
      loading={loading}
      options={options.sort((a, b) => b.make.localeCompare(a.make))}
      groupBy={(option: Vehicle) => option.make.toUpperCase()}
      renderInput={(params) => <TextField {...params} label="Select a Vehicle" />}
      getOptionLabel={(option: Vehicle) => formatVehicleName(option)}
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
      onChange={onChangeWrapper}
      sx={{ width: 300 }}
      size="small"
      noOptionsText="No vehicles found"
    />
  );
};

export default VehicleSearch;
