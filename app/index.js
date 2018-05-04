import React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';

import Navigator from './config/routes';

// export default class App extends React.Component {
//   render() {
//     return (
//       <View style={styles.container}>
//         <Text>kdbfkjsdfbkjsdnf</Text>
//       </View>
//     );
//   }
// }
//

// import Home from './screens/Home';
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

EStyleSheet.build({
  // colors
  $primaryBlue: '#4F6D7A',
  $primaryOrange: '#D57A66',
  $primaryGreen: '#00BD9D',
  $primaryPurple: '#9E768F',
  $white: '#FFFFFF',
  $lightGray: '#F0F0F0',
  $border: '#000',
  $inputText: '#797979',
  $darkText: '#343434',

  // font variables
  $headerSize: 38,
  $headerWeight: '600',
  $regularWeight: '400',
});

export default () => <Navigator />;
