import EStyleSheet from 'react-native-extended-stylesheet';


export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryBlue',
    height: 100,
    position: 'absolute',
    top: 100,
    width: 300,
  },
  blurbText: {
    color: '$lightGray',
    fontWeight: '$regularWeight',
    fontSize: '$headerSize / 3',
    textAlign: 'center',
  },
});
