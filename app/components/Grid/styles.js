import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  grid: {
    marginTop: 10,
    marginBottom: 0,
    justifyContent: "flex-start"
  },
  cell: {
    flex: 1
  },
  space: {
    backgroundColor: "#542a0e",
    borderColor: "#603101",
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
  },
  wallTop: {
    backgroundColor: "#000",
  },
  wallFacing: {
    backgroundColor: "#888"
  },
  highlighted: {
    backgroundColor: "#ff00ff"
  },
  container: {
    flex: 1,
    marginVertical: 20
  }
});
