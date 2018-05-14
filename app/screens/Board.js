import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { autorun } from 'mobx';
import { TileMap } from 'react-game-kit/native';

import GameStore from '../data/GameStore';

export default class Board extends Component {
  static contextTypes = {
    scale: PropTypes.number,
  };
  static propTypes = {
    gameBoard: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = 100;
    this.sourceWidth = 100;
    this.gameBoardWidth = this.tileWidth * 40;
    this.scale = 0.2;
    this.blackTilesMap = this.props.gameBoard.map(a => (a.value === 0 ? 1 : 0));
    this.floorTilesMap = this.props.gameBoard.map(a => (a.value > 0 ? 1 : 0));
    this.wallTilesMap = this.props.gameBoard.map(a => (a.value < 0 ? 1 : 0));
    this.state = {
      stageX: 0,
    };
  }

  componentDidMount() {
    this.cameraWatcher = autorun(() => {
      const targetX = Math.round(GameStore.stageX * this.context.scale);
      this.setState({
        stageX: targetX,
      });
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const targetX = Math.round(GameStore.stageX * nextContext.scale);
    this.setState({
      stageX: targetX,
    })
  }

  componentWillUnmount() {
    this.cameraWatcher();
  }

  getWrapperStyles() {
    return {
      position: 'absolute',
      transform: [{ translateX: this.state.stageX }],
    };
  }

  render() {
    console.log(`board render began and scale=${this.context.scale}`);
    return (
      <View >
        <TileMap
          src={require("../data/images/Black_square.jpeg")}
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.sourceWidth}
          layers={[this.blackTilesMap]}
          scale={this.context.scale}

        />
        <TileMap
          src={require("../data/images/Magenta-square_100px.gif")}
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.sourceWidth}
          layers={[this.wallTilesMap]}
          scale={this.context.scale}

        />
        <TileMap
          src={require("../data/images/Cyan-square.png")}
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.sourceWidth}
          layers={[this.floorTilesMap]}
          scale={this.context.scale}
        />
      </View>
    );
  }
}
