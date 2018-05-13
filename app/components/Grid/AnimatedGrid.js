import React from "react";
import PropTypes from "prop-types";
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, View, ScrollView, FlatList, Animated, Vibration } from "react-native";

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

const ANIMATION_DURATION = 1000;

export default class AnimatedGrid extends React.Component {
  static propTypes = {
    items: PropTypes.array,
    getCellStyle: PropTypes.func,
    itemDimension: PropTypes.number,
    onPress: PropTypes.func,
    viewPortWidth: PropTypes.number,
    viewPortHeight: PropTypes.number,
    numColumns: PropTypes.number,
    isHuman: PropTypes.bool,
    playerSpace: PropTypes.object,
    zoom: PropTypes.string,
    cellsInRow: PropTypes.number,
    scrollOffset: PropTypes.number,
    zoomedInValue: PropTypes.number,
    zoomedOutValue: PropTypes.number,
  }

  state = {
    // working height/width animation but laggy since not run by native driver
    // itemDimension: new Animated.Value(this.props.zoomedInValue),
    itemDimension: new Animated.Value(this.props.zoomedInValue),
    isZoomedIn: true,
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
    if (this.state.itemDimension._value === this.props.zoomedInValue && !this.state.isZoomedIn) {
      // this.scrollViewRef.scrollTo({ x: 0, animated: true });
      // this.flatListRef.scrollToIndex({ animated: true, index: 0 });
      Animated.timing(this.state.itemDimension, {
        // working height/width animation but laggy since not run by native driver
        toValue: this.props.zoomedOutValue,
        duration: ANIMATION_DURATION,
        // useNativeDriver: true,
      }).start();
      setTimeout(() => {
      }, ANIMATION_DURATION + 500);
    } else if (this.state.itemDimension._value === this.props.zoomedOutValue && this.state.isZoomedIn) {
      console.log("= =\n I ");
      Animated.timing(
        this.state.itemDimension,
        {
          // working height/width animation but laggy since not run by native driver
          toValue: this.props.zoomedInValue,
          duration: ANIMATION_DURATION,
          // useNativeDriver: true,
        },
      ).start();
      setTimeout(() => {
        // this.scrollViewRef.scrollTo({ x: this.getXScrollPos(), animated: true });
        // this.flatListRef.scrollToIndex({ animated: true, index: this.getIndex() });
      }, ANIMATION_DURATION + 500);
    } else if (this.props.zoom === "close") {
      setTimeout(() => {
        // this.scrollViewRef.scrollTo({ x: this.getXScrollPos(), animated: true });
        // this.flatListRef.scrollToIndex({ animated: true, index: this.getIndex() });
      }, 500);
    }
  }

  getItemLayout = (data, index) => (
    this.state.isZoomedIn ?
      { length: this.props.zoomedInValue, offset: this.props.zoomedInValue * index, index } :
      { length: this.props.zoomedOutValue, offset: this.props.zoomedOutValue * index, index }
  )

  alterZoom = () => {
    Vibration.vibrate(10);
    this.setState({ isZoomedIn: !this.state.isZoomedIn });
    Vibration.cancel();
  }

  render() {
    let { itemDimension } = this.state;
    return (
      <View style={[
        this.state.isZoomedIn ?
        { justifyContent: "center", width: (this.props.viewPortWidth), height: (this.props.viewPortHeight) } 
        : { justifyContent: "center", width: (this.props.viewPortWidth), height: ((this.props.cellsInRow + 5) * this.props.zoomedOutValue) }]}
      >
        <ScrollView ref={(ref) => { this.scrollViewRef = ref; }} horizontal pagingEnabled>
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
                  itemDimension={itemDimension}
                  isZoomedIn={this.state.isZoomedIn}
                  alterZoom={this.alterZoom}
                />
              );
            }}
            extraData={[this.props.isHuman, this.props.items, this.props.zoom]}
            getItemLayout={this.getItemLayout}
            initialScrollIndex={this.getIndex()}
            initialNumToRender={this.props.cellsInRow / 2}
            pagingEnabled={true}
          />
        </ScrollView>
      </View>
    );
  }
}
