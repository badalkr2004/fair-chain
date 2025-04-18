import React from "react";

type Props = {
  children: React.ReactNode;
};
const IntermediaryLayout = ({ children }: Props) => {
  return <div>{children}</div>;
};

export default IntermediaryLayout;
