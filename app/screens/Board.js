import React, { Component } from "react";
import { View, Dimensions, PanResponder, Image } from "react-native";
import PropTypes from "prop-types";
import { TileMap } from "react-game-kit/native";

export default class Board extends Component {
  static contextTypes = {
    scale: PropTypes.number,
    loop: PropTypes.object,
  };
  static propTypes = {
    gameBoard: PropTypes.array,
  };

  constructor(props) {
    super(props);
    // this.counter = 0;
    this.screenDimensions = Dimensions.get("window");
    this.tileWidth = Math.ceil(this.screenDimensions.height/40);
    this.sourceWidth = this.tileWidth;
    this.gameBoardWidth = this.tileWidth * 40;
    this.tileMapArray = this.props.gameBoard.map(a => a.imageKey);
    this.state = {
      isZooming: false,
      isMoving: false,
      initialX: null,
      offsetLeft: 0,
      initialTop: 0,
      initialLeft: 0,
      top: 0,
      left: 0,
      tileSize: 100,
    };
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        // console.log("on pan responder grant");
      },
      onPanResponderMove: (evt, gestureState) => {
        let { touches } = evt.nativeEvent;
        if (touches.length == 1 && !this.state.isZooming) {
          this.processTouch(touches[0].pageX, touches[0].pageY);
        }
      },
      onPanResponderRelease: () => {
        // console.log("on pan responder release");
        this.setState({
          isZooming: false,
          isMoving: false,
        });
      }
    });
  }

  // componentDidMount() {
  //   this.context.loop.subscribe(this.update);
  // }

  // componentWillUnmount() {
  //   this.context.loop.unsubscribe(this.update);
  // }

  processTouch(x, y) {
    if (!this.state.isMoving) {
      this.setState({
        isMoving: true,
        initialX: x,
        initialY: y,
        initialTop: this.state.top,
        initialLeft: this.state.left,
      });
    } else {
      let left = this.state.initialLeft + x - this.state.initialX;
      let top = this.state.initialTop + y - this.state.initialY;
      // console.log(left, this.gameBoardWidth);
      this.setState({
          left:
            left > 0
            ? 0
            : left < (-this.gameBoardWidth + this.screenDimensions.width)
              ? (-this.gameBoardWidth + this.screenDimensions.width)
              : left,
          top:
            top > 0
            ? 0
            : top < (-this.gameBoardWidth + this.screenDimensions.height)
            ? (-this.gameBoardWidth + this.screenDimensions.height)
            : top,
        });
    }
  }

  // update = () => {};

  fixImageStyle = (index) => {
    return ({ left: ((index - 1) * this.tileWidth) });
  }

  renderTile = (tile, src, styles) => {
    switch (tile.index) {
      // wall top northwest
      case 1:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-nw.gif")} />;
      // wall top north
      case 2:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-n.gif")} />;
        // wall top northeast
      case 3:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-ne.gif")} />;
      // // wall top west
      case 4:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-w.gif")} />;
      // // wall top east
      case 5:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-e.gif")} />;
      // wall top southwest
      case 6:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-sw.gif")} />;
      // wall top south
      case 7:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-s.gif")} />;
      // wall top southeast
      case 8:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-se.gif")} />;
      // wall top center
      case 9:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-c.gif")} />;
      // wall front northwest
      case 10:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-f-nw-2.gif")} />;
      // wall front north
      case 11:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-f-n-1.gif")} />;
      // wall front northeast
      case 12:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-f-ne-2.gif")} />;
      // wall front southwest
      case 13:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-f-sw-2.gif")} />;
      // wall front south
      case 14:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-f-s-1.gif")} />;
      // wall front southeast
      case 15:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-f-se-2.gif")} />;
      // wall front last two rows
      case 16:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-f-n-3.gif")} />;
      // floor tile northwest
      case 17:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-nw.gif")} />;
      // floor tile north
      case 18:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-n-1.gif")} />;
      // floor tile northeast
      case 19:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-ne.gif")} />;
      // floor tile west
      case 20:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-w-1.gif")} />;
      // floor tile east
      case 21:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-e-1.gif")} />;
      // floor tile center
      case 22:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-1.gif")} />;
      // wall top north/south
      case 23:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-n-s.png")} />;
      // wall top east/west
      case 24:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-e-w.png")} />;
      // wall top cap north/south/west -- typo in image name -- this is correct image!!
      case 25:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-n-s-e.png")} />;
      // wall top cap north/south/east -- typo in image name -- this is correct image!!
      case 26:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-n-s-w.png")} />;
      // wall top cap north/east/west
      case 27:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-n-e-w.png")} />;
      // wall top cap east/south/west
      case 28:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/wall-t-e-s-w.png")} />;
      // floor tile north 2
      case 29:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-n-2.gif")} />;
      // floor tile north 3
      case 30:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-n-3.gif")} />;
      // floor tile west 2
      case 31:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-w-2.gif")} />;
      // floor tile east 2
      case 32:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-e-2.gif")} />;
      // floor tile center 5
      case 33:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-5.gif")} />;
      // floor tile center 6
      case 34:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-6.gif")} />;
      // floor tile center 7
      case 35:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-7.gif")} />;
      // floor tile center 2
      case 36:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-2.gif")} />;
      // floor tile center 3
      case 37:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-3.gif")} />;
      // floor tile center 4
      case 38:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-4.gif")} />;
      // floor tile center 8
      case 39:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-8.gif")} />;
      // floor tile center 9
      case 40:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-c-9.gif")} />;
      // floor tile e2n
      case 41:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-e2n.gif")} />;
      // floor tile w2n
      case 42:
        return <Image resizeMode="stretch" style={[styles, this.fixImageStyle()]} source={require("../data/images/floor-w2n.gif")} />;
      default:
        console.log('the imageKey for this tile was not assigned correctly', tile);
        break;
    }
  };

  render() {
    // Math.floor((this.tileWidth / this.state.zoom)/16)
    // Math.floor(100*this.state.zoom);
    // let scale = this.state.tileSize;
    // console.log('tileMap', this.tileMapArray);
    return (
      <View style={{ position: 'absolute', left: this.state.left, top: this.state.top }} {...this._panResponder.panHandlers} >
        <TileMap
          src={require("../data/images/Black_square.jpeg")}
          tileSize={this.tileWidth}
          columns={40}
          rows={40}
          sourceWidth={this.tileWidth}
          layers={[this.tileMapArray]}
          renderTile={this.renderTile}
        />
      </View>
    );
  }
}
