import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions, Image } from "react-native";
import { Loop, Stage } from "react-game-kit/native";

import Board from "./Board";

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool,
    playerSpace: PropTypes.object,
    isHuman: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    // console.log("Engine");
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = Math.ceil(this.screenDimensions.height / 40);
    this.gameBoardWidth = this.tileWidth * 40;
    this.playerX = (props.playerSpace.name % 40) * this.tileWidth;
    this.playerY = Math.floor(props.playerSpace.name / 40) * this.tileWidth;
    this.state = {
      playerSpace: this.props.playerSpace,
      playerX: this.playerX,
      playerY: this.playerY,
    };
  }

  render() {
    return (
      <Loop style={{ backgroundColor: "#212121" }}>
        <Stage
          height={this.screenDimensions.height}
          width={this.screenDimensions.width}
          style={{ backgroundColor: "#515151" }}
        >
          <Board
            gameBoard={this.props.gameBoard}
            isHuman={this.props.isHuman}
          />
          <Image style={{ position: 'absolute', top: this.state.playerX - this.tileWidth, left: this.state.playerY, height: (this.tileWidth * 2), width: this.tileWidth, resizeMode: 'contain' }} source={require("../data/images/human.png")} />
        </Stage>
      </Loop>
    );
  }
}
