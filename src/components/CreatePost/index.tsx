import React, { FC, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AddPhotoAlternate, AddPhotoAlternateOutlined,
  Cancel, PostAddOutlined, SavedSearch,
} from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Backdrop, Button, Card, ClickAwayListener,
  Divider, IconButton, Stack, Step,
  StepButton, StepContent,
  Stepper, Tab, Tabs, TextField,
  Tooltip, Typography, styled,
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from "dayjs";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ENDPOINTS, MEDIA_ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { PostRouter } from "../FeedPost";
import { ImageUpload } from "../ImageUpload";
import Loader from "../Loader";
import PlateDecoder from "../PlateDecoder/Dialog";
import ProfileAvatar from "../ProfileAvatar";
import { VehicleSearch } from "../Typeahead/VehicleSearch";
import { useFeedProvider } from "../../Providers/FeedProvider";

type PostForm = {
  type: FeedPost["type"];
  post_text: string;
  event_date: FeedPost["event_date"];
  mileage: FeedPost["mileage"];
  locale: FeedPost["locale"];
  image: FileList;
};

const StyledCard = styled(Card, { shouldForwardProp: (p) => p !== "expanded" })(({ expanded }: { expanded?: boolean }) => ({
  position: expanded ? "sticky" : "relative",
  top: expanded ? "16px" : "unset",
  padding: "16px 24px",
  borderRadius: "8px",
  margin: "8px 0",
  border: "1px solid #e5e5e5",
  zIndex: 10,
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

/**
 * A general feed call-to-action for creating a post
 *
 * @returns {JSX.Element}
 */
const CreatePost: FC = () => {
  const { user, token } = useAuthProvider();
  const { createPost: addFeedPost } = useFeedProvider();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [postType, setPostType] = useState<FeedPost["type"]>("generic");
  const [plateDecoderOpen, setPlateDecoderOpen] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);

  const { register, watch, setValue, reset, resetField, control } = useForm<PostForm>();
  const postText = watch("post_text");
  const imageUpload = watch("image");

  const stepStatuses: { [step: number]: boolean | undefined } = useMemo(() => {
    const step0 = !!selectedVehicle;
    const step1 = (postType === "photo" && !!imageUpload?.[0]) || (postType === "generic" && !!postText);
    const step2 = step1;
    const step3 = step0 && step1 && step2;

    return {
      0: step0,
      1: step1,
      2: step2,
      3: step3,
    };
  }, [selectedVehicle, imageUpload, postText, postType]);

  const resetPost = () => {
    setExpand(false);
    setActiveStep(0);
    setSelectedVehicle(null);
    setPostType("generic");
    reset();
  };

  const setExpand = (expanded: boolean) => setExpanded(expanded);

  const selectVehicle = (e: React.SyntheticEvent, vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  };

  const changePostType = (e: React.SyntheticEvent, type: FeedPost["type"]) => {
    setPostType(type);
    setValue("type", type);
    resetField("image");
  };

  const generateDemoPost = (): FeedPost => ({
    type: postType,
    post_text: postText,
    image: postType === "photo" && imageUpload?.[0]
      ? { large: URL.createObjectURL(imageUpload?.[0]) }
      : null,
    person: { ...user },
    mileage: watch("mileage"),
    locale: watch("locale"),
    vehicle: selectedVehicle,
    event_date: watch("event_date"),
    post_date: new Date().toISOString(),
  } as FeedPost);

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

      const { status, image } = await response?.json() || {};
      if (status !== STATUS_OK || !image) {
        setPosting(false);
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
        client: "better-vinwiki",
        event_date: watch("event_date") ? dayjs(watch("event_date")).toISOString() : "",
        locale: watch("locale"),
        mileage: watch("mileage"),
        text: watch("post_text"),
        class_name: postType,
        image_uuid: imageUUID,
      }),
    }).catch(() => null);

    const { status, post } = await response?.json() || {};
    if (status !== STATUS_OK || !post) {
      setPosting(false);
      return;
    }

    addFeedPost?.({ ...post, person: user, vehicle: selectedVehicle });
    setPosting(false);
    resetPost();
  };

  return (
    <>
      <Backdrop open={expanded} sx={{ zIndex: 9 }} />
      <ClickAwayListener onClickAway={() => setExpand(false)}>
        <StyledCard expanded={expanded} elevation={expanded ? 12 : 0}>
          {(expanded && posting) && (
            <Loader fullscreen={false} />
          )}
          {expanded && (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5">Compose</Typography>
                <Tooltip title="Cancel" placement="left">
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
              <Step completed={stepStatuses[0]}>
                <StepButton onClick={() => setActiveStep(0)}>Select a Vehicle</StepButton>
                <StyledStepContent TransitionProps={{ unmountOnExit: false }}>
                  <Stack direction="row" gap={1} sx={{ mb: 1 }}>
                    <VehicleSearch value={selectedVehicle} onChange={selectVehicle} />
                    <Tooltip title="Advanced Search" placement="right">
                      <IconButton onClick={() => setPlateDecoderOpen(true)}>
                        <SavedSearch />
                      </IconButton>
                    </Tooltip>
                    <PlateDecoder
                      open={plateDecoderOpen}
                      onConfirm={(vehicle) => {
                        setSelectedVehicle(vehicle);
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
                        <StyledTab icon={<PostAddOutlined />} iconPosition="start" label="Text" value="generic" />
                        <StyledTab icon={<AddPhotoAlternateOutlined />} iconPosition="start" label="Photo" value="photo" />
                        {/* <StyledTab icon={<ReceiptLong />} iconPosition="start" label="Repair" disabled /> */}
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
                          preview={imageUpload?.[0] && URL.createObjectURL(imageUpload?.[0])}
                          onPreviewClick={() => resetField("image")}
                          onDrop={(e) => setValue("image", e.dataTransfer.files)}
                        />
                      </TabPanel>
                    </TabContext>
                  </StyledCard>
                  <Button onClick={() => setActiveStep(2)} disabled={!stepStatuses[1]}>Next</Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!stepStatuses[1]}>
                <StepButton onClick={() => setActiveStep(2)}>
                  Event Details
                  {" "}
                  <Typography variant="caption" color="text.secondary">(Optional)</Typography>
                </StepButton>
                <StyledStepContent>
                  <Stack direction="column" gap={1} alignItems="flex-start" sx={{ mb: 1 }}>
                    <Controller
                      name="event_date"
                      control={control}
                      render={({ field }) => (
                        <DateTimePicker
                          {...field}
                          value={field.value ? dayjs(field.value) : null}
                          slotProps={{ textField: { size: "small", placeholder: "Event Date" } }}
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
                  <Button onClick={() => setActiveStep(3)} disabled={!stepStatuses[2]}>Next</Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!stepStatuses[2]} last>
                <StepButton onClick={() => setActiveStep(3)}>Preview & Submit</StepButton>
                <StyledStepContent>
                  <PostRouter {...generateDemoPost()} isPreview />
                  <Button disabled={Object.values(stepStatuses).some((s) => !s)} onClick={createPost}>Post</Button>
                </StyledStepContent>
              </Step>
            </Stepper>
          )}

          {!expanded && (
            <Stack direction="row" spacing={2} alignItems="center">
              <ProfileAvatar username={user?.username || ""} avatar={user?.avatar} />
              <TextField placeholder="Compose a new post" size="small" onClick={() => setExpand(true)} fullWidth />
              <IconButton onClick={() => { setPostType("photo"); setExpand(true); }}>
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
