import React, { FC, useMemo } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import GenericText from "./GenericText";
import { ProviderState, Context as AuthCtx } from "../../Providers/AuthProvider";
import { STATUS_ERROR, STATUS_OK } from "../../config/Endpoints";

const TestParent: FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(() => ({
    authenticated: true,
    token: "ABC-EXAMPLE-TOKEN",
  }), []) as ProviderState;

  return (
    <MemoryRouter>
      <AuthCtx.Provider value={value}>
        {children}
      </AuthCtx.Provider>
    </MemoryRouter>
  );
};

describe("GenericText > Plain text", () => {
  it("renders empty text nominally", () => {
    const { getByTestId } = render(<GenericText content="" />);

    expect(getByTestId("generic-text-body")).toHaveTextContent("");
  });

  it("renders plain text nominally", () => {
    const text = "Hello, world!";
    const { getByTestId } = render(<GenericText content={text} />);

    expect(getByTestId("generic-text-body")).toHaveTextContent(text);
  });

  it("renders plain text with special characters", () => {
    const text = "Hello, world!@#$%^&*()_+";
    const { getByTestId } = render(<GenericText content={text} />);

    expect(getByTestId("generic-text-body")).toHaveTextContent(text);
  });

  it("renders plain text ignoring newlines and tabs", () => {
    const text = "Hello,\nworld!\tTab";
    const { getByTestId } = render(<GenericText content={text} />);

    expect(getByTestId("generic-text-body")).toHaveTextContent("Hello, world! Tab");
  });

  it("renders a long string of text without errors", () => {
    const text = 'xyz long string'.repeat(10e5);
    const { getByTestId } = render(<GenericText content={text} />);

    expect(getByTestId("generic-text-body")).toHaveTextContent(text);
  });
});

describe("GenericText > Mention Chips", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("renders a single mention chip nominally", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ status: STATUS_OK, person: { uuid: "AAA-UUID-1234" } }),
    } as Response));

    const { getByTestId } = render(
      <TestParent>
        <GenericText content="hey @xyz your UUID better be AAA-UUID-1234" />
      </TestParent>,
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByTestId("mention-chip")).toBeInTheDocument());
    expect(getByTestId("mention-chip")).toHaveAttribute("href", "/profile/AAA-UUID-1234");
  });

  it("renders multiple mention chips without errors", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ status: STATUS_OK, person: { uuid: Math.random().toString() } }),
    } as Response));

    const { getAllByTestId } = render(
      <TestParent>
        <GenericText content="hey @personone and @fourfivesix check this out" />
      </TestParent>,
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getAllByTestId("mention-chip").length).toBe(2));
  });

  it("does nothing for non-existent users", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ status: STATUS_ERROR, person: null }),
    } as Response));

    const { container, queryByTestId } = render(
      <TestParent>
        <GenericText content="hey @carrotman you don't exist" />
      </TestParent>,
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(queryByTestId("mention-chip")).not.toBeInTheDocument());
    expect(container.querySelector("span")).toHaveTextContent("@carrotman");
  });

  it("embeds by VINwiki Profile links", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ status: STATUS_OK, profile: { username: "realUUIDbutFAKEusername" } }),
    } as Response));

    const { getByTestId } = render(
      <TestParent>
        <GenericText content="text message prefix https://web.vinwiki.com/#/person/41e3b496-9e2f-4561-87a7-1cc38e7b4057 text suffix" />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getByTestId("mention-chip")).toBeInTheDocument());
    expect(getByTestId("mention-chip")).toHaveTextContent("realUUIDbutFAKEusername");
    expect(getByTestId("mention-chip")).toHaveAttribute("href", `/profile/41e3b496-9e2f-4561-87a7-1cc38e7b4057`);
  });

  it("embeds by Better-VINwiki Profile links", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ status: STATUS_OK, profile: { username: "anotherUUIDwithFAKEusername" } }),
    } as Response));

    const { getByTestId } = render(
      <TestParent>
        <GenericText content="text message prefix https://vinwiki.pages.dev/profile/41e3b496-9e2f-4561-87a7-1cc38e7b4057 text suffix" />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getByTestId("mention-chip")).toBeInTheDocument());
    expect(getByTestId("mention-chip")).toHaveTextContent("anotherUUIDwithFAKEusername");
    expect(getByTestId("mention-chip")).toHaveAttribute("href", `/profile/41e3b496-9e2f-4561-87a7-1cc38e7b4057`);
  });
});

describe("GenericText > Hyperlinks", () => {
  it("renders a single hyperlink nominally", () => {
    const text = 'abcxyz https://www.google.com xyzabc';
    const { getByTestId } = render(<GenericText content={text} />);

    expect(getByTestId("generic-link")).toBeInTheDocument();
    expect(getByTestId("generic-link")).toHaveAttribute("href", "https://www.google.com");
    expect(getByTestId("generic-link")).toHaveAttribute("target", "_blank");
    expect(getByTestId("generic-link")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders multiple hyperlinks without errors", () => {
    const text = 'hyperlink1 after this https://www.example.com hyperlink2 after this https://www.google.com';
    const { getAllByTestId } = render(<GenericText content={text} />);

    const firstLink = getAllByTestId("generic-link")[0];
    expect(firstLink).toBeInTheDocument();
    expect(firstLink).toHaveAttribute("href", "https://www.example.com");
    expect(firstLink).toHaveAttribute("target", "_blank");
    expect(firstLink).toHaveAttribute("rel", "noopener noreferrer");

    const secondLink = getAllByTestId("generic-link")[1];
    expect(secondLink).toBeInTheDocument();
    expect(secondLink).toHaveAttribute("href", "https://www.google.com");
    expect(secondLink).toHaveAttribute("target", "_blank");
    expect(secondLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  const invalidUrls = ["http://www.google.com", "www.google.com", "google.com", "google", "www.google", "google.com/"];
  it.each(invalidUrls)("does not render invalid URL as hyperlink %s", (text) => {
    const { getByTestId, queryByTestId } = render(<GenericText content={text} />);

    expect(getByTestId("generic-text-body")).toHaveTextContent(text);
    expect(queryByTestId("generic-link")).not.toBeInTheDocument();
  });

  const validUrls = [
    "https://mail.google.com/mail/u/0/#inbox",
    "https://www.s1000rrforum.com/forums/#/topics/240380?page=1",
    "https://dakboard.com/pricing",
    "https://www.youtube.com/watch?v=K7WvHT0_Q7I",
    "https://www.example.net/?berry=action&blood=berry",
    "https://g.co",
    "https://www.nytimes.com/2021/09/01/us/politics/biden-afghanistan-taliban.html",
    "https://www.amazon.com/",
    "https://www.reddit.com/r/funny/comments/pf2z1y/this_is_what_happens_when_you_leave_your_kids/",
    "https://www.instagram.com/p/CTZJZJZJZJZ/",
    "https://www.cnn.com/2021/09/01/politics/afghanistan-evacuation-biden-administration/index.html",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.apple.com/iphone-13-pro/",
    "https://www.nike.com/",
    "https://www.espn.com/nfl/story/_/id/32182120/baltimore-ravens-trade-linebacker-kenny-young-los-angeles-rams-exchange-draft-picks",
    "https://www.netflix.com/title/80100172",
    "https://www.examplenews.org/article123",
    "https://www.samplerestaurantrecipes.net/chocolate-cake",
    "https://www.examplegallery.info/paintings",
    "https://www.techreviewsample.xyz/smartphones",
    "https://www.learningsample.edu/history",
    "https://www.traveladventuresite.travel/paris-trip",
    "https://www.sampleshoponline.store/electronics",
    "https://www.fitnesssample.fit/workouts",
    "https://www.entertainmentgossip.news/celebrity-news",
    "https://www.scifisample.space/star-wars-theories",
  ];
  it.each(validUrls)("renders hyperlink %s without errors", (text) => {
    const { getByTestId } = render(<GenericText content={`abc prefix ${text} abc suffix`} />);

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    expect(getByTestId("generic-link")).toBeInTheDocument();
    expect(getByTestId("generic-link")).toHaveAttribute("href", text);
  });
});

describe("GenericText > Vehicle Chips", () => {
  const validVINs = [
    "1GNEK13Z22R298984",
    "2G1FP22G3Y2100001",
    "3VWCM31Y25M360000",
    "4T1BE46KX7U522000",
    "5FNRL387X7B400001",
    "JN1AZ34D13T101000",
    "KMHDN45D11U100001",
    "1C4BJWEG2DL500001",
    "1G1YY22G2X5100001",
    "1FAFP45X9XF200001",
  ];

  it.each(validVINs)("identifies VIN tag #%s without errors", (text) => {
    const { getByTestId } = render(
      <TestParent>
        <GenericText content={`text message prefix #${text} text suffix`} />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    expect(getByTestId("vehicle-chip")).toBeInTheDocument();
    expect(getByTestId("vehicle-chip")).toHaveAttribute("href", `/vehicle/${text}`);
  });

  it("embeds Vehicles by VINwiki VIN links", () => {
    const { getByTestId } = render(
      <TestParent>
        <GenericText content="text message prefix https://web.vinwiki.com/#/vin/3KPF24AD2PE655484 text suffix" />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    expect(getByTestId("vehicle-chip")).toBeInTheDocument();
    expect(getByTestId("vehicle-chip")).toHaveAttribute("href", `/vehicle/3KPF24AD2PE655484`);
  });

  it("embeds Vehicles by Better-VINwiki VIN links", () => {
    const { getByTestId } = render(
      <TestParent>
        <GenericText content="text message prefix https://vinwiki.pages.dev/vehicle/3KPF24AD2PE655484 text suffix" />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    expect(getByTestId("vehicle-chip")).toBeInTheDocument();
    expect(getByTestId("vehicle-chip")).toHaveAttribute("href", `/vehicle/3KPF24AD2PE655484`);
  });

  it("embeds multiple Vehicles by Better-VINwiki VIN links", () => {
    const links = [
      "https://vinwiki.pages.dev/vehicle/3KPF24AD2PE655484",
      "http://localhost:3000/vehicle/1GHDU06L7ST306552",
      "http://vinwiki.pages.dev/vehicle/ZFF83CMB000249869",
      "http://localhost:3000/vehicle/2B5WB35Y01K526660",
    ];

    const { getByTestId, getAllByTestId } = render(
      <TestParent>
        <GenericText content={links.join(" abc abc prefix suffix ")} />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    expect(getAllByTestId("vehicle-chip").length).toEqual(links.length);
    links.forEach((link, i) => {
      expect(getAllByTestId("vehicle-chip")[i]).toHaveAttribute("href");
    });
  });
});

describe("GenericText > OBD Codes", () => {
  const validOBDs = [
    { code: "P0000", description: "No trouble code" },
    { code: "P0997", description: "Shift Solenoid F Control Circuit Range/Performance" },
    { code: "P0387", description: "Crankshaft Position Sensor B Circuit Low Input" },
    { code: "P0009", description: "Engine Position System Performance - Bank 1" },
  ];

  it.each(validOBDs)("identifies OBD Code $code with description $description", ({ code, description }) => {
    const { getByTestId } = render(<GenericText content={`text message prefix ${code} text suffix`} />);

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    expect(getByTestId("trouble-code-chip")).toBeInTheDocument();
    expect(getByTestId("trouble-code-chip")).toHaveAttribute("aria-label", description);
    expect(getByTestId("trouble-code-chip").textContent).toEqual(code);
  });
});

describe("GenericText > List Chips", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("embeds by VINwiki Vehicle List links", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ status: STATUS_OK, list: { name: "A very real list" } }),
    } as Response));

    const { getByTestId } = render(
      <TestParent>
        <GenericText content="text message prefix https://web.vinwiki.com/#/lists/41e3b496-9e2f-4561-87a7-1cc38e7b4057 text suffix" />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getByTestId("list-chip")).toBeInTheDocument());
    expect(getByTestId("list-chip")).toHaveTextContent("A very real list");
    expect(getByTestId("list-chip")).toHaveAttribute("href", `/list/41e3b496-9e2f-4561-87a7-1cc38e7b4057`);
  });

  it("embeds by Better-VINwiki Vehicle List links", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve({ status: STATUS_OK, list: { name: "ABC Test List" } }),
    } as Response));

    const { getByTestId } = render(
      <TestParent>
        <GenericText content="text message prefix https://vinwiki.pages.dev/list/41e3b496-9e2f-4561-87a7-1cc38e7b4057 text suffix" />
      </TestParent>,
    );

    expect(getByTestId("generic-text-body")).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getByTestId("list-chip")).toBeInTheDocument());
    expect(getByTestId("list-chip")).toHaveTextContent("ABC Test List");
    expect(getByTestId("list-chip")).toHaveAttribute("href", `/list/41e3b496-9e2f-4561-87a7-1cc38e7b4057`);
  });
});
