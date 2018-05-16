import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dimensions } from "react-native";
import { Loop, Stage } from "react-game-kit/native";

import Board from "./Board";

export default class Engine extends Component {
  static propTypes = {
    gameBoard: PropTypes.array,
    tilesInRow: PropTypes.number,
    boardFinished: PropTypes.bool
  };

  constructor(props) {
    super(props);
    console.log("Engine");
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = 100;
    this.sourceWidth = 100;
    this.gameBoardWidth = this.tileWidth * 40;
  }

  render() {
    console.log("engine render began");
    return (
      <Loop style={{ backgroundColor: "#212121" }}>
        <Stage
          height={this.gameBoardWidth}
          width={this.gameBoardWidth}
          style={{ backgroundColor: "#515151" }}
        >
          {this.props.boardFinished ? (
            <Board
              gameBoard={this.props.gameBoard}
            />
          ) : null}
        </Stage>
      </Loop>
    );
  }
}
