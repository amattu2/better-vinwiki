import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AddPhotoAlternate,
  AddPhotoAlternateOutlined,
  Cancel,
  PostAddOutlined,
  SavedSearch,
} from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Alert,
  Backdrop,
  Button,
  Card,
  ClickAwayListener,
  Divider,
  IconButton,
  Stack,
  Step,
  StepButton,
  StepContent,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Theme,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { load } from "exif-library";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ENDPOINTS, MEDIA_ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { ImageUpload } from "../ImageUpload";
import FeedPost from "../FeedPost";
import Loader from "../Loader";
import PlateDecoder from "../PlateDecoder/Dialog";
import ProfileAvatar from "../ProfileAvatar";
import { VehicleSearch } from "../Typeahead/VehicleSearch";
import { useFeedProvider } from "../../Providers/FeedProvider";
import { CONFIG } from "../../config/AppConfig";
import { safeIsoParse } from "../../utils/date";
import { imageToBase64 } from "../../utils/image";

type Props = {
  vehicle?: Vehicle;
};

type PostForm = {
  type: FeedPost["type"];
  post_text: string;
  event_date: Dayjs | null;
  mileage: FeedPost["mileage"];
  locale: FeedPost["locale"];
  image: FileList;
};

const StyledCard = styled(Card, { shouldForwardProp: (p) => p !== "expanded" })<{
  expanded?: boolean;
  theme?: Theme;
}>(({ expanded = false, theme }) => ({
  position: expanded ? "sticky" : "relative",
  top: expanded ? "16px" : "unset",
  padding: "16px 24px",
  borderRadius: "8px",
  margin: "8px 0",
  border: `1px solid ${theme?.palette.divider}`,
  zIndex: expanded ? 10 : "unset",
}));

const StyledTab = styled(Tab)({
  minHeight: "48px",
  textTransform: "none",
});

const StyledStepContent = styled(StepContent)({
  paddingTop: "8px !important",
});

const StyledTextField = styled(TextField)({
  "& .MuiFormHelperText-root": {
    marginLeft: "auto !important",
  },
});

const StyledExifAlert = styled(Alert)({
  marginTop: "8px",
});

/**
 * A general feed call-to-action for creating a post
 *
 * @returns {JSX.Element}
 */
const CreatePost: FC<Props> = ({ vehicle }: Props) => {
  const { profile, token } = useAuthProvider();
  const { addPost: addFeedPost } = useFeedProvider();
  const { enqueueSnackbar } = useSnackbar();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicle || null);
  const [activeStep, setActiveStep] = useState<number>(selectedVehicle ? 1 : 0);
  const [postType, setPostType] = useState<FeedPost["type"]>("generic");
  const [plateDecoderOpen, setPlateDecoderOpen] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [imageHasGpsData, setImageHasGpsData] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { register, watch, setValue, reset, resetField, control } = useForm<PostForm>();
  const postText = watch("post_text");
  const imageUpload = watch("image");

  const stepStatuses: { [step: number]: boolean | undefined } = useMemo(() => {
    const step0 = !!selectedVehicle;
    const step1 =
      (postType === "photo" && !!imageUpload?.[0]) || (postType === "generic" && !!postText);
    const step2 = step1;
    const step3 = step0 && step1 && step2;

    return {
      0: step0,
      1: step1,
      2: step2,
      3: step3,
    };
  }, [selectedVehicle, !!imageUpload?.[0], !!postText, postType]);

  const imagePreview: string | undefined = useMemo(
    () => (imageUpload?.[0] ? URL.createObjectURL(imageUpload?.[0]) : undefined),
    [imageUpload?.[0]]
  );

  const resetPost = () => {
    setExpand(false);
    setActiveStep(!vehicle ? 0 : 1);
    setSelectedVehicle(!vehicle ? null : vehicle);
    setPostType("generic");
    reset();
  };

  const setExpand = (expanded: boolean) => {
    setExpanded(expanded);
    if (expanded) {
      setTimeout(() => {
        cardRef?.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const selectVehicle = (e: React.SyntheticEvent, vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  };

  const changePostType = (e: React.SyntheticEvent, type: FeedPost["type"]) => {
    setPostType(type);
    setValue("type", type);
  };

  const generateDemoPost = (): FeedPost =>
    ({
      type: postType,
      post_text: postText,
      image:
        postType === "photo" && imageUpload?.[0]
          ? { large: URL.createObjectURL(imageUpload?.[0]) }
          : null,
      person: { ...profile },
      mileage: watch("mileage"),
      locale: watch("locale"),
      vehicle: selectedVehicle,
      event_date: safeIsoParse(watch("event_date")) || null,
      post_date: new Date().toISOString(),
    }) as FeedPost;

  const createPost = async () => {
    if (!token || !selectedVehicle?.vin) {
      return;
    }
    if (postType === "generic" && !postText) {
      return;
    }
    if (postType === "photo" && !imageUpload?.[0]) {
      return;
    }

    setPosting(true);

    let imageUUID: string | null = null;
    if (postType === "photo") {
      const formData = new FormData();
      formData.append("media", imageUpload?.[0]);
      formData.append("subject", "vehicle");
      formData.append("subject_id", selectedVehicle.vin);

      const response = await fetch(MEDIA_ENDPOINTS.vehicle_image_add + selectedVehicle.vin, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }).catch(() => null);

      const { status, image } = (await response?.json()) || {};
      if (status !== STATUS_OK || !image) {
        setPosting(false);
        enqueueSnackbar("Failed to upload image. Please retry later.", { variant: "error" });
        return;
      }

      imageUUID = image.uuid;
    }

    const response = await fetch(ENDPOINTS.vehicle_post + selectedVehicle.vin, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        client: CONFIG.API_CLIENT,
        event_date: safeIsoParse(watch("event_date")) || "",
        locale: watch("locale"),
        mileage: watch("mileage"),
        text: watch("post_text"),
        class_name: postType,
        image_uuid: imageUUID,
      }),
    }).catch(() => null);

    const { status, post } = (await response?.json()) || {};
    if (status !== STATUS_OK || !post) {
      setPosting(false);
      enqueueSnackbar("Failed to create post. Please retry later.", { variant: "error" });
      return;
    }

    addFeedPost?.({ ...post, person: profile, vehicle: selectedVehicle });
    setPosting(false);
    resetPost();
  };

  useEffect(() => {
    if (!imageUpload?.[0]) {
      setImageHasGpsData(false);
      return;
    }

    (async () => {
      try {
        const baseImage = await imageToBase64(imageUpload?.[0]).catch(() => null);
        const exifData = load(baseImage || "");

        if (exifData?.GPS && exifData.GPS[0]) {
          setImageHasGpsData(true);
          return;
        }
      } catch (e) {
        /* Pass */
      }

      setImageHasGpsData(false);
    })();
  }, [imageUpload?.[0]]);

  return (
    <>
      <Backdrop open={expanded} sx={{ zIndex: 9 }} />
      <ClickAwayListener onClickAway={() => setExpand(false)}>
        <StyledCard expanded={expanded} elevation={expanded ? 12 : 0} ref={cardRef}>
          {expanded && posting && <Loader fullscreen={false} />}
          {expanded && (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5">Compose</Typography>
                <Tooltip title="Cancel" placement="left" arrow>
                  <IconButton onClick={resetPost} sx={{ ml: "auto !important" }}>
                    <Cancel fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
            </>
          )}
          {expanded && (
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step disabled={!!vehicle} completed={stepStatuses[0]}>
                <StepButton onClick={() => setActiveStep(0)}>Select a Vehicle</StepButton>
                <StyledStepContent TransitionProps={{ unmountOnExit: false }}>
                  <Stack direction="row" gap={1} sx={{ mb: 1 }}>
                    <VehicleSearch value={selectedVehicle} onChange={selectVehicle} />
                    <Tooltip title="Advanced Search" placement="right" arrow>
                      <IconButton onClick={() => setPlateDecoderOpen(true)}>
                        <SavedSearch />
                      </IconButton>
                    </Tooltip>
                    <PlateDecoder
                      open={plateDecoderOpen}
                      onConfirm={(vehicle) => {
                        setSelectedVehicle(vehicle as unknown as Vehicle);
                        setPlateDecoderOpen(false);
                      }}
                      onCancel={() => setPlateDecoderOpen(false)}
                    />
                  </Stack>
                  <Button onClick={() => setActiveStep(1)} size="small" disabled={!stepStatuses[0]}>
                    Next
                  </Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!stepStatuses[0]} completed={stepStatuses[1]}>
                <StepButton onClick={() => setActiveStep(1)}>Post Content</StepButton>
                <StyledStepContent>
                  <StyledCard elevation={4} sx={{ p: 0 }}>
                    <TabContext value={postType}>
                      <Tabs value={postType} onChange={changePostType}>
                        <StyledTab
                          icon={<PostAddOutlined />}
                          iconPosition="start"
                          label="Text"
                          value="generic"
                        />
                        <StyledTab
                          icon={<AddPhotoAlternateOutlined />}
                          iconPosition="start"
                          label="Photo"
                          value="photo"
                        />
                      </Tabs>
                      <TabPanel value="generic">
                        {/* TODO: Add support for typeahead user tags */}
                        <StyledTextField
                          {...register("post_text", { required: true, maxLength: 500 })}
                          placeholder="What's on your mind?"
                          size="small"
                          rows={6}
                          helperText={`${500 - (postText?.length || 0)} of 500 characters`}
                          multiline
                          fullWidth
                        />
                      </TabPanel>
                      <TabPanel value="photo">
                        <StyledTextField
                          {...register("post_text", { required: true, maxLength: 500 })}
                          placeholder="Caption this photo"
                          size="small"
                          helperText={`${500 - (postText?.length || 0)} of 500 characters`}
                          fullWidth
                        />
                        <Divider sx={{ my: 1.5 }} />
                        <ImageUpload
                          InputProps={register("image", { required: postType === "photo" })}
                          preview={imagePreview}
                          onPreviewClick={() => resetField("image")}
                          onDrop={(e) => setValue("image", e.dataTransfer.files)}
                        />
                        {imageHasGpsData === true && (
                          <StyledExifAlert severity="error">
                            This image contains GPS EXIF data that will be accessible to the public
                            if posted.
                          </StyledExifAlert>
                        )}
                      </TabPanel>
                    </TabContext>
                  </StyledCard>
                  <Button onClick={() => setActiveStep(2)} disabled={!stepStatuses[1]}>
                    Next
                  </Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!stepStatuses[1]}>
                <StepButton onClick={() => setActiveStep(2)}>
                  Event Details{" "}
                  <Typography variant="caption" color="text.secondary">
                    (Optional)
                  </Typography>
                </StepButton>
                <StyledStepContent>
                  <Stack direction="column" gap={1} alignItems="flex-start" sx={{ mb: 1 }}>
                    <Controller
                      name="event_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value ? dayjs(field.value) : null}
                          slotProps={{ textField: { size: "small", placeholder: "Event Date" } }}
                          disableFuture
                        />
                      )}
                    />
                    <StyledTextField
                      {...register("locale", { maxLength: 25 })}
                      placeholder="Location"
                      size="small"
                      sx={{ width: "267px" }}
                    />
                    <StyledTextField
                      {...register("mileage", { required: true })}
                      placeholder="Odometer (mi)"
                      size="small"
                      type="number"
                      inputProps={{ min: 0 }}
                      sx={{ width: "267px" }}
                    />
                  </Stack>
                  <Button onClick={() => setActiveStep(3)} disabled={!stepStatuses[2]}>
                    Next
                  </Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!stepStatuses[2]} last>
                <StepButton onClick={() => setActiveStep(3)}>Preview & Submit</StepButton>
                <StyledStepContent>
                  {activeStep === 3 && <FeedPost {...generateDemoPost()} isPreview />}
                  <Button
                    disabled={Object.values(stepStatuses).some((s) => !s)}
                    onClick={createPost}
                  >
                    Post
                  </Button>
                </StyledStepContent>
              </Step>
            </Stepper>
          )}

          {!expanded && (
            <Stack direction="row" spacing={2} alignItems="center">
              <ProfileAvatar username={profile?.username || ""} avatar={profile?.avatar} />
              <TextField
                placeholder="Compose a new post"
                size="small"
                onClick={() => setExpand(true)}
                fullWidth
              />
              <IconButton
                onClick={() => {
                  setPostType("photo");
                  setExpand(true);
                }}
              >
                <AddPhotoAlternate />
              </IconButton>
            </Stack>
          )}
        </StyledCard>
      </ClickAwayListener>
    </>
  );
};

export default CreatePost;
