import { StackNavigator } from 'react-navigation';

import Home from '../screens/Home';
import Game from '../screens/Game';
import Connect from '../screens/Connect';
import Waiting from '../screens/Waiting';

export default StackNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      header: () => null,
    },
  },
  Game: {
    screen: Game,
    navigationOptions: {
      header: () => null,
    },
  },
  Connect: {
    screen: Connect,
    navigationOptions: {
      header: () => null,
    },
  },
  Waiting: {
    screen: Waiting,
    navigationOptions: {
      header: () => null,
    },
  },
});
