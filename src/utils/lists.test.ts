import * as utils from "./lists";

const baseList: List = {
  name: "",
  created_date: "",
  follower_count: 0,
  created_time: 0,
  description: "",
  owner: {
    avatar: "",
    first_name: "",
    last_name: "",
    username: "",
    uuid: "",
  },
  uuid: "",
  vehicle_count: 0,
};

describe("sortLists", () => {
  it("should sort lists in ascending order by creation date", () => {
    const lists: List[] = [
      { ...baseList, created_date: "2018-11-02T23:46:31+00:00" },
      { ...baseList, created_date: "2019-09-03T23:46:31+00:00" },
      { ...baseList, created_date: "2017-05-01T23:46:31+00:00" },
      { ...baseList, created_date: "2024-01-04T23:46:31+00:00" },
    ];

    expect(utils.sortLists(lists, "date")).toEqual([lists[2], lists[0], lists[1], lists[3]]);
  });

  it("should sort lists in descending order by popularity", () => {
    const lists: List[] = [
      { ...baseList, follower_count: 75 },
      { ...baseList, follower_count: 0 },
      { ...baseList, follower_count: 23 },
      { ...baseList, follower_count: 522 },
      { ...baseList, follower_count: 10 },
    ];

    expect(utils.sortLists(lists, "popularity")).toEqual([
      lists[3],
      lists[0],
      lists[2],
      lists[4],
      lists[1],
    ]);
  });

  it("should sort lists in ascending order by list name", () => {
    const lists: List[] = [
      { ...baseList, name: "C" },
      { ...baseList, name: "A" },
      { ...baseList, name: "B" },
    ];

    expect(utils.sortLists(lists, "alpha")).toEqual([lists[1], lists[2], lists[0]]);
  });

  it("should return an empty array if the input is not an array", () => {
    expect(utils.sortLists(null as unknown as List[], "alpha")).toEqual([]);
    expect(utils.sortLists(undefined as unknown as List[], "alpha")).toEqual([]);
    expect(utils.sortLists(1 as unknown as List[], "alpha")).toEqual([]);
  });

  it("should not mutate the original array", () => {
    const lists: List[] = [
      { ...baseList, name: "C" },
      { ...baseList, name: "A" },
      { ...baseList, name: "B" },
    ];

    const sorted = utils.sortLists(lists, "alpha");

    expect(sorted).not.toBe(lists);
  });
});
