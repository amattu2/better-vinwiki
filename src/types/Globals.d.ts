type FeedPostProps = FeedPost & {
  isPreview?: true;
  ref?: Ref<HTMLDivElement>;
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
