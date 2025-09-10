import colors from "@/app/constants/colors";
import { Image, ImageProps } from "expo-image";
import React from "react";

const CoreImage: React.FC<ImageProps> = ({ style, ...rest }) => {
  return (
    <Image
      {...rest}
      style={[
        {
          width: "100%",
          height: "100%",
          backgroundColor: colors.greyBackground,
        },
        style,
      ]}
    />
  );
};

export default CoreImage;
