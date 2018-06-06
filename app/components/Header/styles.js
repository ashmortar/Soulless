import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#212121',
    height: 100,
    position: 'absolute',
    top: 25,
  },
  headerText: {
    fontFamily: 'Perfect DOS VGA 437',
    color: '$white',
    fontWeight: '$headerWeight',
    fontSize: '$headerSize',
  },
});
