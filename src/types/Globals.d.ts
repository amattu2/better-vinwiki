type FeedPostProps = FeedPost & {
  isPreview?: true;
};

type Country = {
  name: string;
  code: string;
};

type Territory = {
  [countryCode: string]: {
    code: string;
    name: string;
  }[];
};
