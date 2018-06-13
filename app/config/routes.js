import { StackNavigator } from 'react-navigation';

import Home from '../screens/Home';
import Game from '../screens/Game';
import GameOver from '../screens/GameOver';
import HowTo from '../screens/HowTo';
import About from '../screens/About';
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
      gesturesEnabled: false,
    },
  },
  Waiting: {
    screen: Waiting,
    navigationOptions: {
      header: () => null,
      gesturesEnabled: false,
    },
  },
  GameOver: {
    screen: GameOver,
    navigationOptions: {
      header: () => null,
      gesturesEnabled: false,
    },
  },
  HowTo: {
    screen: HowTo,
    navigationOptions: {
      header: () => null,
      gesturesEnabled: false,
    },
  },
  About: {
    screen: About,
    navigationOptions: {
      header: () => null,
      gesturesEnabled: false,
    },
  },
});
