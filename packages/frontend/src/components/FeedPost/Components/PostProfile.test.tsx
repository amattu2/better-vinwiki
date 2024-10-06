import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostProfile from "./PostProfile";

// NOTE: Omitting the properties that are specifically needed
const basePost: Omit<FeedPost, "person" | "vehicle" | "mileage"> = {
  uuid: "",
  image: null as unknown as FeedPostImage,
  id: "",
  type: "photo",
  post_date: "",
  event_date: "",
  locale: "",
  client: "",
  comment_count: 0,
  dest_url: "",
  event_time: "",
  post_date_ago: "",
  post_text: "",
  post_time: "",
  subject_uuid: "",
};

// NOTE: Omitting the properties that are specifically needed
const basePerson: Omit<Profile, "uuid" | "username" | "avatar"> = {
  id: 0,
  bio: "",
  display_name: "",
  email: "",
  first_name: "",
  follower_count: 0,
  following_count: 0,
  following_vehicle_count: 0,
  full_name: "",
  last_name: "",
  location: "",
  post_count: 0,
  profile_picture_uuid: "",
  social_facebook: "",
  social_instagram: "",
  social_linkedin: "",
  social_twitter: "",
  website_url: "",
};

const baseVehicle: Omit<Vehicle, "vin" | "year" | "make" | "model"> = {
  icon_photo: "",
  long_name: null,
  trim: null,
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("PostProfile", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(
        <PostProfile
          post={{
            ...basePost,
            person: {
              ...basePerson,
              uuid: "",
              username: "",
              avatar: "",
            },
            vehicle: {
              ...baseVehicle,
              vin: "",
              year: "",
              make: "",
              model: "",
            },
            mileage: 0,
          }}
        />,
        { wrapper: TestWrapper }
      )
    ).not.toThrow();
  });

  it("should render the profile avatar URL if provided", () => {
    const { getByTestId } = render(
      <PostProfile
        post={{
          ...basePost,
          person: {
            ...basePerson,
            uuid: "",
            username: "test.user",
            avatar: "https://example.com/avatar.jpg",
          },
          vehicle: {
            ...baseVehicle,
            vin: "",
            year: "",
            make: "",
            model: "",
          },
          mileage: 0,
        }}
      />,
      { wrapper: TestWrapper }
    );

    expect(getByTestId("post-profile-avatar")).toBeInTheDocument();
    expect(within(getByTestId("post-profile-avatar")).getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg"
    );
  });

  it("should render the username if there is no avatar URL", () => {
    const { getByTestId } = render(
      <PostProfile
        post={{
          ...basePost,
          person: {
            ...basePerson,
            uuid: "",
            username: "test.user",
            avatar: "",
          },
          vehicle: {
            ...baseVehicle,
            vin: "",
            year: "",
            make: "",
            model: "",
          },
          mileage: 0,
        }}
      />,
      { wrapper: TestWrapper }
    );

    expect(getByTestId("post-profile-avatar")).toBeInTheDocument();
    expect(getByTestId("post-profile-avatar")).toHaveTextContent("TE");
  });

  it("should contain the profile username with a link to the profile page", () => {
    const { getByTestId } = render(
      <PostProfile
        post={{
          ...basePost,
          person: {
            ...basePerson,
            uuid: "aaa-bbb-ccc-ddd-eee",
            username: "test.user",
            avatar: "",
          },
          vehicle: {
            ...baseVehicle,
            vin: "",
            year: "",
            make: "",
            model: "",
          },
          mileage: 0,
        }}
      />,
      { wrapper: TestWrapper }
    );

    expect(getByTestId("post-profile-username")).toBeInTheDocument();
    expect(getByTestId("post-profile-username")).toHaveTextContent("@test.user");
    expect(getByTestId("post-profile-username")).toHaveAttribute(
      "href",
      "/profile/aaa-bbb-ccc-ddd-eee"
    );
  });

  it("should contain the vehicle description and a link to the vehicle page", () => {
    const { getByTestId } = render(
      <PostProfile
        post={{
          ...basePost,
          person: {
            ...basePerson,
            uuid: "",
            username: "",
            avatar: "",
          },
          vehicle: {
            ...baseVehicle,
            vin: "vin-number-here",
            year: "2021",
            make: "Toyota",
            model: "Corolla",
          },
          mileage: 0,
        }}
      />,
      { wrapper: TestWrapper }
    );

    expect(getByTestId("post-profile-vehicle")).toBeInTheDocument();
    expect(getByTestId("post-profile-vehicle")).toHaveTextContent(/2021 Toyota Corolla/i); // NOTE: Formatting is covered by utils tests
    expect(getByTestId("post-profile-vehicle")).toHaveAttribute("href", "/vehicle/vin-number-here");
  });

  it("should include the odometer reading if provided", () => {
    const { getByTestId } = render(
      <PostProfile
        post={{
          ...basePost,
          person: {
            ...basePerson,
            uuid: "",
            username: "",
            avatar: "",
          },
          vehicle: {
            ...baseVehicle,
            vin: "",
            year: "",
            make: "",
            model: "",
          },
          mileage: 123456,
        }}
      />,
      { wrapper: TestWrapper }
    );

    expect(getByTestId("post-profile-odometer")).toBeInTheDocument();
    expect(getByTestId("post-profile-odometer")).toHaveTextContent("123,456");
  });

  it.each([0, null, undefined, "not a number"])(
    "should not include the odometer reading if it is %",
    (mileage) => {
      const { queryByTestId } = render(
        <PostProfile
          post={{
            ...basePost,
            person: {
              ...basePerson,
              uuid: "",
              username: "",
              avatar: "",
            },
            vehicle: {
              ...baseVehicle,
              vin: "",
              year: "",
              make: "",
              model: "",
            },
            mileage: mileage as number,
          }}
        />,
        { wrapper: TestWrapper }
      );

      expect(queryByTestId("post-profile-odometer")).not.toBeInTheDocument();
    }
  );
});
