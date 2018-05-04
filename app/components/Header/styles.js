import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryBlue',
    height: 100,
    position: 'absolute',
    top: 25,
  },
  headerText: {
    color: '$white',
    fontWeight: '$headerWeight',
    fontSize: '$headerSize',
  },
});
