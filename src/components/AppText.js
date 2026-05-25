import React from 'react';
import { Text as RNText } from 'react-native';
import { useFontSize } from '../context/FontSizeContext';

const AppText = ({ style, variant = 'base', children, ...props }) => {
  const { scaledSizes } = useFontSize();

  // Map variant to scaled size
  const getFontSize = () => {
    switch (variant) {
      case 'small':
        return scaledSizes.small;
      case 'heading':
        return scaledSizes.heading;
      case 'title':
        return scaledSizes.title;
      case 'sanskrit':
        return scaledSizes.sanskrit;
      case 'large':
        return scaledSizes.large;
      case 'base':
      default:
        return scaledSizes.base;
    }
  };

  const fontSize = getFontSize();
  const textStyle = Array.isArray(style) ? style : [style];

  return (
    <RNText style={[{ fontSize }, ...textStyle]} {...props}>
      {children}
    </RNText>
  );
};

export default AppText;
