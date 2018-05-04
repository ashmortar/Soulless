import React from 'react';
import { View, FlatList } from 'react-native';
import PropTypes from 'prop-types';


import styles from './styles';
import ListItem from './ListItem';
import Separator from './Separator';

const GameList = ({ currentGames, onPress }) => (
  <View style={styles.row}>
    <FlatList
      data={currentGames}
      renderItem={({ item }) => (
        <ListItem
          text={item}
          onPress={onPress}
        />
      )}
      keyExtrator={item => item}
      ItemSeparatorComponent={Separator}
    />
  </View>
);

GameList.propTypes = {
  currentGames: PropTypes.array,
  onPress: PropTypes.func,
};

export default GameList;
