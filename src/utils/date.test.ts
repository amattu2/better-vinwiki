import dayjs, { Dayjs } from "dayjs";
import * as utils from "./date";

describe("formatDate", () => {
  it("should format date", () => {
    const date = new Date("2024-10-09T13:21:00-04:00");
    expect(utils.formatDate(date)).toBe("October 9, 2024");
  });

  it("should use the provided locale", () => {
    const date = new Date("2024-10-09T13:21:00-04:00");
    expect(utils.formatDate(date, "fr-FR")).toBe("9 octobre 2024");
  });
});

describe("formatTime", () => {
  it("should format time", () => {
    const date = new Date("2024-10-09T13:21:00-04:00");
    expect(utils.formatTime(date)).toBe("1:21 PM");
  });

  it("should use the provided locale", () => {
    const date = new Date("2024-10-09T13:21:00-04:00");
    expect(utils.formatTime(date, "fr-FR")).toBe("13:21");
  });
});

describe("formatDateTime", () => {
  it("should show the full date and time if older than 12 hours", () => {
    const date = new Date("2009-10-09T13:21:00-04:00");
    expect(utils.formatDateTime(date)).toBe("October 9, 2009 at 1:21 PM");
  });

  it("should include 'today' prefix if the date is within 12hrs", () => {
    const date = new Date();
    expect(utils.formatDateTime(date, true)).toMatch(/^today at \d{1,2}:\d{2} (AM|PM)$/);
  });

  it("should not include the date if the date is within 12hrs", () => {
    const date = new Date();
    expect(utils.formatDateTime(date, false)).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
  });

  it("should use the provided locale", () => {
    const date = new Date("2015-01-02T13:21:00-04:00");
    expect(utils.formatDateTime(date, false, "fr-FR")).toBe("2 janvier 2015 at 12:21");
  });
});

describe("formatDateMMYY", () => {
  it("should format date as MM/YY", () => {
    const date = new Date("2024-10-09T13:21:00-04:00");
    expect(utils.formatDateMMYY(date)).toBe("10/24");
  });

  it("should use the provided locale", () => {
    const date = new Date("2024-10-09T13:21:00-04:00");
    expect(utils.formatDateMMYY(date, "fr-FR")).toBe("10/24");
  });
});

describe("formatNHTSADate", () => {
  it("should format NHTSA date if the date is valid", () => {
    expect(utils.formatNHTSADate("01/12/2024")).toBe("December 1st, 2024");
  });

  it("should return the original date if the date is invalid", () => {
    expect(utils.formatNHTSADate("2024-01-01")).toBe("2024-01-01");
  });
});

describe("parseNHTSADate", () => {
  it("should parse NHTSA date", () => {
    const date = utils.parseNHTSADate("01/12/2024");
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(11); // zero-based
    expect(date.getDate()).toBe(1);
  });

  it("should return an invalid date if the date is invalid", () => {
    const date = utils.parseNHTSADate("2024-01-01");
    expect(date.toString()).toBe("Invalid Date");
  });
});

describe("isValidEventDate", () => {
  it("should return true for valid event and post dates", () => {
    expect(utils.isValidEventDate("2024-10-09T13:21:00-04:00", "2024-10-25T13:21:00-04:00")).toBe(
      true
    );
  });

  it.each<string>([
    "",
    "ABC invalid date",
    "2022-01-01T13:21:00-010101",
    "2022-01-01T13:21:00-04:00-04:00",
    "23-01-2022",
    "0000-00-00T00:00:00-00:00",
    "1968-01-01T11:60:00-05:00",
  ])("should throw an exception for date %s with invalid format", (date) => {
    expect(() => utils.isValidEventDate(date, "2022-10-09T13:21:00-04:00")).toThrow(
      "Invalid event date format"
    );
    expect(() => utils.isValidEventDate("2022-10-09T13:21:00-04:00", date)).toThrow(
      "Invalid post date format"
    );
  });

  const eventDatesAfterPostDate: FeedPost[] = [
    { event_date: "2019-07-13T13:21:10-04:00", post_date: "2018-05-23T10:10:00-04:00" }, // Year after
    { event_date: "2019-05-23T13:21:00-04:00", post_date: "2019-05-22T10:10:00-04:00" }, // Day after
    { event_date: "2019-05-22T13:21:00-04:00", post_date: "2019-05-22T10:10:00-04:00" }, // Hours after
  ] as FeedPost[];
  it.each(eventDatesAfterPostDate)(
    "should throw an exception for event_date $event_date after post_date $post_date",
    ({ event_date, post_date }) => {
      expect(() => utils.isValidEventDate(event_date, post_date)).toThrow(
        "Event date is after post date"
      );
    }
  );

  const eventDatesEqualPostDate: FeedPost[] = [
    { event_date: "2019-05-22T10:10:00-04:00", post_date: "2019-05-22T10:10:00-04:00" }, // Same TZ, date, hour
    { event_date: "2005-08-12T12:10:00-04:00", post_date: "2005-08-12T16:10:00+00:00" }, // Different TZ, same date, hour
    { event_date: "2015-10-05T13:25:00-08:00", post_date: "2015-10-05T17:25:00-04:00" }, // Different TZ, same date, hour
  ] as FeedPost[];
  it.each(eventDatesEqualPostDate)(
    "should throw an exception for event_date $event_date equal to post_date $post_date",
    ({ event_date, post_date }) => {
      expect(() => utils.isValidEventDate(event_date, post_date)).toThrow(
        "Event date is the same day and hour as the post date"
      );
    }
  );
});

describe("safeIsoParse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return null if the date is null", () => {
    expect(utils.safeIsoParse(null)).toBeNull();
  });

  it("should return null if the date is not a Dayjs object", () => {
    expect(utils.safeIsoParse("invalid date" as unknown as Dayjs)).toBeNull();
  });

  it("should return the ISO string if the date is a Dayjs object", () => {
    const date = dayjs("2024-10-09T13:21:00-04:00");
    expect(utils.safeIsoParse(date)).toBe("2024-10-09T17:21:00.000Z");
  });

  it("should catch Dayjs errors and return null", () => {
    const date = dayjs("invalid date");
    expect(utils.safeIsoParse(date)).toBeNull();
  });
});
