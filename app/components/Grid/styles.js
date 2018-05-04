import EStyleSheet from 'react-native-extended-stylesheet';
import { StyleSheet } from 'react-native';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 40
  },
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 60,
    marginBottom: 40,
    height: 100,
  },
  separator: {
    backgroundColor: '#000',
    height: StyleSheet.hairlineWidth,
    flex: 1,
    marginLeft: 20,
  },
  // icon: {
  //   width: 19,
  //   marginRight: 11,
  // },
  // text: {
  //   color: '#000',
  //   fontSize: 14,
  //   paddingVertical: 20,
  //   fontWeight: '300',
  // },
});


// alignItems: 'center',
// backgroundColor: '#fff',
// height: 800,
