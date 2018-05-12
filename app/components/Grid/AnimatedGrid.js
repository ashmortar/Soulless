import React from "react";
import PropTypes from "prop-types";
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, View, TouchableHighlight, ScrollView, FlatList } from "react-native";

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
    } else if (xOffset > this.props.gridDimension) {
      return this.props.gridDimension;
    } else {
      return xOffset;
    }
  }

  componentDidUpdate() {
    // console.log('animated grid did update', this.props.zoom, this.props.itemDimension, this.props.gridDimension);
    if (this.props.zoom === "close") {
      setTimeout(() => {
        this.scrollViewRef.scrollTo({ x: this.getXScrollPos(), animated: true });
        this.flatListRef.scrollToIndex({ animated: true, index: this.getIndex() });
      }, 500);
    } else {
      setTimeout(() => {
        this.scrollViewRef.scrollToEnd({ animated: true })
      }, 100);
    }
  }

  getItemLayout = (data, index) => (
    { length: this.props.itemDimension, offset: this.props.itemDimension * index, index }
  )

  renderItem = ({ item, index }) => {
    if (this.props.isHuman) {
      if (item.isRevealed) {
        return (
          <TouchableHighlight onPress={() => this.props.onPress(item)} style={{ width: this.props.itemDimension }}>
            <View style={[
              { height: this.props.itemDimension, width: this.props.itemDimension },
              styles.cell,
              item.value === 0 ? styles.wallTop : null,
              item.value === -1 ? styles.wallFacing : null,
              item.value > 0 ? styles.space : null,
              item.isHighlighted ? styles.highlighted : null,
            ]}
            >
              <Text style={{ fontSize: this.props.itemDimension * 0.6, textAlign: 'center', color: '#ff00ff' }}>{item.hasHuman ? 'H' : null}{item.hasMonster ? 'M' : null}{item.hasCache ? 'C' : null}</Text>
            </View>
          </TouchableHighlight>);
      } else {
        return (
          <View style={[
            { height: this.props.itemDimension, width: this.props.itemDimension },
            styles.cell,
            styles.wallTop,
          ]}
          />);
      }
    } else {
      return (
        // <TouchableHighlight onPress={() => this.props.onPress(item)} style={{ width: this.props.itemDimension }}>
        //   <View style={[
        //     { height: this.props.itemDimension, width: this.props.itemDimension },
        //     styles.cell,
        //     item.value === 0 ? styles.wallTop : null,
        //     item.value === -1 ? styles.wallFacing : null,
        //     item.value > 0 ? styles.space : null,
        //     item.isHighlighted ? styles.highlighted : null,
        //   ]}
        //   >
        //     <Text style={{ fontSize: this.props.itemDimension * 0.6, textAlign: 'center', color: '#ff00ff' }}>{item.hasHuman ? 'H' : null}{item.hasMonster ? 'M' : null}{item.hasCache ? 'C' : null}</Text>
        //   </View>
        // </TouchableHighlight>
        <AnimatedGridItem {...this.props} />
      );
    }
  }

  render() {
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
            renderItem={this.renderItem}
            extraData={[this.props.isHuman, this.props.items, this.props.zoom]}
            getItemLayout={this.getItemLayout}
            initialScrollIndex={this.getIndex()}
          />
        </ScrollView>
      </View>
    );
  }
}
