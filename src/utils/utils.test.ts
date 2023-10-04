import { isValidEventDate } from './date';

describe('Utils isValidEventDate', () => {
  const invalidDateFormats: string[] = [
    '',
    'ABC invalid date',
    '2022-01-01T13:21:00-010101',
    '2022-01-01T13:21:00-04:00-04:00',
    '23-01-2022',
    '2019/01/01',
    '07/19/1998',
    "August 19, 2021 04:00:00",
    "0000-00-00T00:00:00-00:00",
    "1968-01-01T11:60:00-05:00",
  ];
  it.each(invalidDateFormats)('throws an exception for date %s with invalid format', (date) => {
    expect(() => isValidEventDate(date, '2022-10-09T13:21:00-04:00')).toThrow("Invalid event date format");
    expect(() => isValidEventDate('2022-10-09T13:21:00-04:00', date)).toThrow("Invalid post date format");
  });

  const eventDatesAfterPostDate: FeedPost[] = [
    { event_date: '2019-07-13T13:21:10-04:00', post_date: '2018-05-23T10:10:00-04:00' }, // Year after
    { event_date: '2019-05-23T13:21:00-04:00', post_date: '2019-05-22T10:10:00-04:00' }, // Day after
    { event_date: '2019-05-22T13:21:00-04:00', post_date: '2019-05-22T10:10:00-04:00' }, // Hours after
  ] as FeedPost[];
  it.each(eventDatesAfterPostDate)('throws an exception for event_date $event_date after post_date $post_date', ({ event_date, post_date }) => {
    expect(() => isValidEventDate(event_date, post_date)).toThrow("Event date is after post date");
  });

  const eventDatesEqualPostDate: FeedPost[] = [
    { event_date: '2019-05-22T10:10:00-04:00', post_date: '2019-05-22T10:10:00-04:00' }, // Same TZ, date, hour
    // NOTE: Need to add more tests for different TZs but same calculated timestamp
  ] as FeedPost[];
  it.each(eventDatesEqualPostDate)('throws an exception for event_date $event_date equal to post_date $post_date', ({ event_date, post_date }) => {
    expect(() => isValidEventDate(event_date, post_date)).toThrow("Event date is the same day and hour as the post date");
  });
});