import React from "react";
import PropTypes from "prop-types";
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, View, TouchableHighlight, ScrollView, Animated, FlatList } from "react-native";

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
  }

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
          <TouchableHighlight onPress={() => this.props.onPress(item)} style={{ width: this.props.itemDimension }}>
            <View style={[
              { height: this.props.itemDimension, width: this.props.itemDimension },
              styles.cell,
              styles.wallTop,
            ]}
            >
              <Text style={{ fontSize: this.props.itemDimension * 0.6, textAlign: 'center', color: '#ff00ff' }}>{item.hasHuman ? 'H' : null}{item.hasMonster ? 'M' : null}{item.hasCache ? 'C' : null}</Text>
            </View>
          </TouchableHighlight>);
      }
    } else {
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
    }
  }

  render() {
    return (
      <View style={{ marginTop: 10, marginBottom: 0, justifyContent: "flex-start", width: (this.props.screenWidth - 15), height: (this.props.screenWidth - 15) }}>
        <ScrollView horizontal={true} >
          <FlatList
            data={this.props.items}
            style={styles.container}
            horizontal={false}
            numColumns={this.props.numColumns}
            keyExtractor={item => item.name.toString()}
            renderItem={this.renderItem}
            extraData={[this.props.isHuman, this.props.items.isHighlighted, this.props.items.isRevealed, this.props.items.hasCache, this.props.items.hasMonster]}
          />
        </ScrollView>
      </View>
    );
  }
}


