import { isValidEventDate } from "./date";

describe("Utils isValidEventDate", () => {
  const invalidDateFormats: string[] = [
    "",
    "ABC invalid date",
    "2022-01-01T13:21:00-010101",
    "2022-01-01T13:21:00-04:00-04:00",
    "23-01-2022",
    "0000-00-00T00:00:00-00:00",
    "1968-01-01T11:60:00-05:00",
  ];
  it.each(invalidDateFormats)("throws an exception for date %s with invalid format", (date) => {
    expect(() => isValidEventDate(date, "2022-10-09T13:21:00-04:00")).toThrow(
      "Invalid event date format"
    );
    expect(() => isValidEventDate("2022-10-09T13:21:00-04:00", date)).toThrow(
      "Invalid post date format"
    );
  });

  const eventDatesAfterPostDate: FeedPost[] = [
    { event_date: "2019-07-13T13:21:10-04:00", post_date: "2018-05-23T10:10:00-04:00" }, // Year after
    { event_date: "2019-05-23T13:21:00-04:00", post_date: "2019-05-22T10:10:00-04:00" }, // Day after
    { event_date: "2019-05-22T13:21:00-04:00", post_date: "2019-05-22T10:10:00-04:00" }, // Hours after
  ] as FeedPost[];
  it.each(eventDatesAfterPostDate)(
    "throws an exception for event_date $event_date after post_date $post_date",
    ({ event_date, post_date }) => {
      expect(() => isValidEventDate(event_date, post_date)).toThrow(
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
    "throws an exception for event_date $event_date equal to post_date $post_date",
    ({ event_date, post_date }) => {
      expect(() => isValidEventDate(event_date, post_date)).toThrow(
        "Event date is the same day and hour as the post date"
      );
    }
  );
});
