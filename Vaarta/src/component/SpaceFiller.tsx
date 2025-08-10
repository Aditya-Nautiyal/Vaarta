import React from "react";
import { View } from "react-native";

const defaultProps = {
  margin: 12,
};

const SpaceFiller = ({ margin = defaultProps.margin }) => {
  return <View style={{ marginVertical: margin }} />;
};

export default SpaceFiller;
