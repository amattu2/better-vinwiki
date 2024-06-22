import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostMeta from "./PostMeta";

// NOTE: Omitting the properties that are specifically needed
const basePost: Omit<FeedPost, "post_date" | "event_date" | "locale" | "client"> = {
  comment_count: 0,
  dest_url: "",
  event_time: "",
  id: "",
  image: null as unknown as FeedPostImage,
  person: null as unknown as Profile,
  post_date_ago: "",
  post_text: "",
  post_time: "",
  subject_uuid: "",
  type: "photo",
  uuid: "",
  vehicle: null as unknown as Vehicle,
};

describe("PostMeta", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(
        <PostMeta
          post={{
            ...basePost,
            post_date: "",
            event_date: "",
            locale: "",
            client: "",
          }}
        />
      )
    ).not.toThrow();
  });

  it("should render the post date", () => {
    const { getByTestId } = render(
      <PostMeta
        post={{
          ...basePost,
          post_date: "2024-06-19T13:21:00-04:00",
          event_date: "",
          locale: "",
          client: "",
        }}
      />
    );

    expect(getByTestId("metadata-post-date")).toBeInTheDocument();
    expect(getByTestId("metadata-post-date")).toHaveTextContent(/[\w]/i); // NOTE: Date format is covered by other test cases
  });

  it("should include a tooltip for the event date if different than the post date", async () => {
    const { getByTestId, findByRole } = render(
      <PostMeta
        post={{
          ...basePost,
          post_date: "2024-06-19T13:21:00-04:00",
          event_date: "2024-05-20T10:10:00-04:00",
          locale: "",
          client: "",
        }}
      />
    );

    expect(getByTestId("metadata-post-date")).toBeInTheDocument();

    await userEvent.hover(getByTestId("metadata-post-date"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(/event date [\w]/i); // NOTE: Date format is covered by other test cases
  });

  it("should render the locale if provided", () => {
    const { getByTestId } = render(
      <PostMeta
        post={{
          ...basePost,
          post_date: "",
          event_date: "",
          locale: "Georgia, USA",
          client: "",
        }}
      />
    );

    expect(getByTestId("metadata-post-locale")).toBeInTheDocument();
    expect(getByTestId("metadata-post-locale")).toHaveTextContent("Georgia, USA");
  });

  it("should render the client if provided", () => {
    const { getByTestId } = render(
      <PostMeta
        post={{
          ...basePost,
          post_date: "",
          event_date: "",
          locale: "",
          client: "iOS",
        }}
      />
    );

    expect(getByTestId("metadata-post-client")).toBeInTheDocument();
    expect(getByTestId("metadata-post-client")).toHaveTextContent("iOS");
  });

  it.each<string>(["web", "vinbot"])("should not include the client if it is '%p'", (client) => {
    const { queryByText, queryByTestId } = render(
      <PostMeta
        post={{
          ...basePost,
          post_date: "",
          event_date: "",
          locale: "",
          client,
        }}
      />
    );

    expect(queryByTestId("metadata-post-client")).not.toBeInTheDocument();
    expect(queryByText(client)).not.toBeInTheDocument();
  });
});
