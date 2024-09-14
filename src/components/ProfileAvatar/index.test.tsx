import { render } from "@testing-library/react";
import ProfileAvatar from "./index";

describe("ProfileAvatar", () => {
  it("should render the profile picture URL if provided", () => {
    const { getByRole } = render(
      <ProfileAvatar username="test" avatar="https://example.com/avatar.jpg" />
    );

    expect(getByRole("img")).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("should render the first two letters of the username if no avatar is provided", () => {
    const { container } = render(<ProfileAvatar username="test" />);

    expect(container).toHaveTextContent("TE");
  });

  it("should render 'NA' if no username is provided or profile picture URL are provided", () => {
    const { container } = render(<ProfileAvatar username="" avatar="" />);

    expect(container).toHaveTextContent("NA");
  });

  it("should render as rounded if the rounded prop is provided", () => {
    const { container } = render(<ProfileAvatar username="test" rounded />);

    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toHaveStyle("border-radius: 50%");
  });

  it("should render with a border radius of 8px if the rounded prop is not provided", () => {
    const { container } = render(<ProfileAvatar username="test" />);

    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toHaveStyle("border-radius: 8px");
  });
});
