import React, { useState } from "react";
import { Input, StyledProps, Icon, createIcon, IconButton } from "native-base";
import { Mask, useMaskedInputProps } from "react-native-mask-input";
import * as ethers from "ethers";

const ClipBoardIcon = createIcon({
  viewBox: "0 0 24 24",
  d: "M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z"
});

const ClipboardButton = (props: any) => (
  <IconButton icon={<ClipBoardIcon size="md" />} borderRadius="full" {...props} />
);

const addressMask = (() => {
  const buf = ["0", "x"];
  const len = 42;

  buf.length = len;
  return buf.fill(/[a-f0-9]/i as any, 2, len);
})();

export const isAddressValid = (v: string) => ethers.utils.isAddress(v);
export const AddressInput = ({
  address,
  onChange,
  ...props
}: { address?: string; onChange: (v: string) => void } & StyledProps) => {
  const [input, setInput] = useState<string>(address || "");
  const mask = addressMask;
  const maskedInputProps = useMaskedInputProps({
    value: input,
    onChangeText: (masked: string) => {
      setInput(masked);
      onChange(masked);
    },
    mask
  });

  return <Input isInvalid={isAddressValid(input) === false} {...maskedInputProps} {...props} />;
};