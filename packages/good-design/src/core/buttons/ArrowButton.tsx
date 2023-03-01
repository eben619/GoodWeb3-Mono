import React, { FC } from "react";
import BasePressable, { BasePressableProps } from "./BasePressable";
import { Box, ArrowForwardIcon } from "native-base";

const ArrowButton: FC<BasePressableProps> = ({ text, onPress, ...props }: BasePressableProps) => {
  return (
    <BasePressable text={text} onPress={onPress} variant="arrowIcon" {...props}>
      <Box w="46" h="46" mr="1.5" bg="primary" borderRadius="50px" justifyContent="center" alignItems="center">
        <ArrowForwardIcon color="white" />
      </Box>
    </BasePressable>
  );
};

export default ArrowButton;
