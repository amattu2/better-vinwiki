import React, { FC, Suspense } from "react";
import Loader from "../Loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SuspenseWrapper = (Component: FC) => (props: any) => (
  <Suspense fallback={<Loader />}>
    <Component {...props} />
  </Suspense>
);
