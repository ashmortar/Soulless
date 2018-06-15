import EStyleSheet from 'react-native-extended-stylesheet';
import { StyleSheet } from 'react-native';

export default EStyleSheet.create({
  $underlayColor: '$border',
  row: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '$white',
  },
  text: {
    color: '$darkText',
    fontSize: '$headerSize / 3',
    fontFamily: 'Perfect DOS VGA 437',
  },
  separator: {
    backgroundColor: '$border',
    height: StyleSheet.hairlineWidth,
    flex: 1,
    marginLeft: 20,
  },
  container: {
    alignItems: 'center',
  },
});
