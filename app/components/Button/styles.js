import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    height: 30,
    minWidth: 40,
    padding: 10,
    borderRadius: 15,
    borderColor: '$primaryOrange',
    borderWidth: 2,
    backgroundColor: '$darkText',
  },
  icon: {
    width: 19,
    marginRight: 11,
  },
  text: {
    fontSize: '$headerSize / 3.5',
    paddingVertical: 20,
    fontWeight: '$regularWeight',
    color: '$white',
  },
});
