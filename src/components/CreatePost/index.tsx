import React, { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AddPhotoAlternate, Cancel, PostAddOutlined, SavedSearch } from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Backdrop, Button, Card, ClickAwayListener,
  Divider, IconButton, Stack, Step,
  StepButton, StepContent,
  Stepper, Tab, Tabs, TextField,
  Tooltip, Typography, styled
} from "@mui/material";
import { useLockedBody } from "usehooks-ts";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { PostRouter } from "../FeedPost";
import ProfileAvatar from "../ProfileAvatar";
import VehicleSearch from "../Typeahead/VehicleSearch";
import PlateDecoder from "../PlateDecoder/Dialog";

type PostForm = {
  type: FeedPost["type"];
  post_text: string;
};

const StyledCard = styled(Card)({
  padding: "16px 24px",
  borderRadius: "8px",
  margin: "8px 0",
  border: "1px solid #e5e5e5",
  position: "relative",
  zIndex: 10,
});

const StyledTab = styled(Tab)({
  minHeight: "48px",
});

const StyledStepContent = styled(StepContent)({
  paddingTop: "8px !important",
});

/**
 * A general feed call-to-action for creating a post
 *
 * @returns {JSX.Element}
 */
const CreatePost: FC = () => {
  const { user } = useAuthProvider();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activePostType, setActivePostType] = useState<FeedPost["type"]>("generic");
  const [plateDecoderOpen, setPlateDecoderOpen] = useState<boolean>(false);

  const { register, watch, setValue } = useForm<PostForm>();
  const postText = watch("post_text");

  const demoPost: FeedPost = useMemo(() => ({
    type: activePostType,
    post_text: postText,
    image: { large: "https://picsum.photos/seed/picsum/800/600" }, // TODO: dynamic
    person: { ...user },
    vehicle: selectedVehicle,
    post_date: new Date().toISOString(),
  }), [user, activePostType, selectedVehicle, postText]) as FeedPost;

  const reset = () => {
    setExpand(false);
    setActiveStep(0);
    setSelectedVehicle(null);
    setActivePostType("generic");
  };

  const setExpand = (expanded: boolean) => setExpanded(expanded);

  const selectVehicle = (e: React.SyntheticEvent, vehicle: Vehicle | null, reason: string) => {
    setSelectedVehicle(vehicle)
  };

  const setPostType = (e: React.SyntheticEvent, type: FeedPost["type"]) => {
    setActivePostType(type);
    setValue("type", type);
  }

  useLockedBody(expanded, 'root');

  return (
    <>
      <Backdrop open={expanded} sx={{ zIndex: 9 }} />
      <ClickAwayListener onClickAway={() => setExpand(false)}>
        <StyledCard elevation={expanded ? 12 : 0} onFocus={() => setExpand(true)}>
          {expanded && (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5">Compose</Typography>
                <Tooltip title="Cancel" placement="left">
                  <IconButton onClick={reset} sx={{ ml: "auto !important" }}>
                    <Cancel fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Divider sx={{ my: 1.5 }}/>
            </>
          )}

          {expanded && (
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step completed={!!selectedVehicle}>
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
                  <Button onClick={() => setActiveStep(1)} size="small" disabled={!selectedVehicle}>
                    Next
                  </Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!selectedVehicle} completed={!!postText}>
                <StepButton onClick={() => setActiveStep(1)}>Post Content</StepButton>
                <StyledStepContent>
                  <StyledCard elevation={0} sx={{ p: 0 }}>
                    <TabContext value={activePostType}>
                      <Tabs value={activePostType} onChange={setPostType}>
                        <StyledTab icon={<PostAddOutlined />} iconPosition="start" label="Post" value="generic" />
                        <StyledTab icon={<AddPhotoAlternate />} iconPosition="start" label="Photo" value="photo"/>
                      </Tabs>
                      <TabPanel value="generic">
                        {/* TODO: support typehead user tagging */}
                        <TextField
                          {...register("post_text", { required: true })}
                          placeholder="What's on your mind?"
                          size="small"
                          multiline
                          minRows={4}
                          maxRows={6}
                          fullWidth
                        />
                      </TabPanel>
                      <TabPanel value="photo">
                        {/* TODO: image upload with preview and textfield */}
                      </TabPanel>
                    </TabContext>
                  </StyledCard>
                  <Button onClick={() => setActiveStep(2)} disabled={!postText}>Next</Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!postText}>
                <StepButton onClick={() => setActiveStep(2)}>Event Details</StepButton>
                <StyledStepContent>
                  {/* TODO: Inputs for location, miles, or the event date */}
                  <Button onClick={() => setActiveStep(3)}>Next</Button>
                </StyledStepContent>
              </Step>
              <Step disabled={!postText} completed={false} last>
                <StepButton onClick={() => setActiveStep(3)}>Preview & Submit</StepButton>
                <StyledStepContent>
                  <PostRouter {...demoPost} isPreview />
                  <Button>Post</Button>
                </StyledStepContent>
              </Step>
            </Stepper>
          )}

          {!expanded && (
            <Stack direction="row" spacing={2} alignItems="center">
              <ProfileAvatar username={user?.username || ""} avatar={user?.avatar} />
              <TextField placeholder="Compose a new post" size="small" fullWidth />
              <IconButton onClick={() => setActivePostType("photo")}>
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
