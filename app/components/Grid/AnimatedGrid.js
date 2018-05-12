import React from "react";
import PropTypes from "prop-types";
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, View, TouchableHighlight, ScrollView, FlatList, Animated } from "react-native";

import AnimatedGridItem from './AnimatedGridItem';

const styles = EStyleSheet.create({
  grid: {
    marginTop: 10,
    marginBottom: 0,
    justifyContent: "flex-start",
  },
  cell: {
    borderWidth: 0.5,
  },
  space: {
    backgroundColor: "#fff",
  },
  wallTop: {
    backgroundColor: "#000",
  },
  wallFacing: {
    backgroundColor: "#777",
  },
  highlighted: {
    backgroundColor: "#ff00ff",
  },
  container: {
    flex: 1,
    marginVertical: 20,
  },
});

const ANIMATION_DURATION = 500;

export default class AnimatedGrid extends React.Component {
  static propTypes = {
    items: PropTypes.array,
    getCellStyle: PropTypes.func,
    itemDimension: PropTypes.number,
    onPress: PropTypes.func,
    screenWidth: PropTypes.number,
    gridDimension: PropTypes.number,
    numColumns: PropTypes.number,
    isHuman: PropTypes.bool,
    playerSpace: PropTypes.object,
    zoom: PropTypes.string,
    cellsInRow: PropTypes.number,
    scrollOffset: PropTypes.number,
  }

  state = {
    itemDimension: new Animated.Value(this.props.zoomedInValue),
  }

  getIndex = () => {
    const offsetIndex = (Math.floor(this.props.playerSpace.name / this.props.cellsInRow) - this.props.scrollOffset);
    if (offsetIndex < 0) {
      return 0;
    } else if (offsetIndex > 39) {
      return 39;
    } else {
      return offsetIndex;
    }
  }

  getXScrollPos = () => {
    const xOffset = ((this.props.itemDimension * (this.props.playerSpace.name % this.props.cellsInRow)) - (this.props.itemDimension * this.props.scrollOffset));
    if (xOffset < 0) {
      return 0;
    } else if (xOffset > this.props.itemDimension) {
      return this.props.itemDimension;
    } else {
      return xOffset;
    }
  }

  componentDidUpdate() {
    if (this.state.itemDimension._value === (this.props.zoomedInValue) && this.props.zoom === "far") {
      Animated.timing(
        this.state.itemDimension,
        {
          toValue: this.props.zoomedOutValue,
          duration: ANIMATION_DURATION,
        },
      ).start();
      setTimeout(() => {
        this.scrollViewRef.scrollTo({ x: 0, y: 0, animated: true });
      }, ANIMATION_DURATION + 500);
    } else if (this.state.itemDimension._value === (this.props.zoomedOutValue) && this.props.zoom === "close") {
      Animated.timing(
        this.state.itemDimension,
        {
          toValue: this.props.zoomedInValue,
          duration: ANIMATION_DURATION,
        },
      ).start();
      setTimeout(() => {
        this.scrollViewRef.scrollTo({ x: this.getXScrollPos(), animated: true });
        this.flatListRef.scrollToIndex({ animated: true, index: this.getIndex() });
      }, ANIMATION_DURATION + 500);
    } else if (this.props.zoom === "close") {
      setTimeout(() => {
        this.scrollViewRef.scrollTo({ x: this.getXScrollPos(), animated: true });
        this.flatListRef.scrollToIndex({ animated: true, index: this.getIndex() });
      }, 500);
    }
  }

  getItemLayout = (data, index) => {
    let { itemDimension } = this.state;
    return (
      { length: itemDimension._value, offset: itemDimension._value * index, index }
    );
  }

  renderItem = ({ item, index }) => {
    return (
      <AnimatedGridItem style={{ width: itemDimension, height: itemDimension }} {...this.props} index={index} animatedViewDimension={itemDimension} />
    );
  }
  
  render() {
    let { itemDimension } = this.state;
    return (
      <View style={{ margin: 5, justifyContent: "center", width: (this.props.screenWidth), height: (this.props.screenWidth + 100) }}>
        <ScrollView ref={(ref) => { this.scrollViewRef = ref; }} horizontal>
          <FlatList
            ref={(ref) => { this.flatListRef = ref; }}
            data={this.props.items}
            style={styles.container}
            horizontal={false}
            numColumns={this.props.numColumns}
            keyExtractor={item => item.name.toString()}
            renderItem={({ item, index }) => {
              return (
                <AnimatedGridItem
                  {...this.props}
                  index={index}
                  animatedViewDimension={itemDimension}
                />
              );
            }}
            extraData={[this.props.isHuman, this.props.items, this.props.zoom]}
            getItemLayout={this.getItemLayout}
            initialScrollIndex={this.getIndex()}
          />
        </ScrollView>
      </View>
    );
  }
}
