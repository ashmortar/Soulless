import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions, Image } from 'react-native';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';


class Bar extends Component {
  static propTypes = {
    isHuman: PropTypes.bool,
    outOfMoves: PropTypes.bool,
    onItemSelected: PropTypes.func,
    shrineAmount: PropTypes.number,
  }


  renderButton = () => {
    if (this.props.outOfMoves) {
      return(
        <TouchableOpacity
          onPress={()=>{this.props.onItemSelected('endTurn');}}
          disabled={!this.props.outOfMoves}
          isVisible={this.props.outOfMoves}
        >
          <View style={{
            padding: 5,
            paddingHorizontal: 9,
            borderRadius: 25,
            borderColor: '#D57A66',
            borderWidth: 2,
            backgroundColor: '#343434',
            marginLeft: Dimensions.get("window").width / 3 + 20,
          }}>
            <Text style={{ color: '#fff' }}>✓</Text>
          </View>
        </TouchableOpacity>
      );
    }
  }


  getBar = () => {
    let text1;
    if (this.props.isHuman) {
      text1 = 'Priest';
    } else {
      text1 = 'Evil';
    }
    let shrineAmount = this.props.shrineAmount;

    // let src={require("../data/images/shrine.png")}
    return(
      <View style={{backgroundColor:'#212121', padding: 10, flexDirection: 'row', alignItems: 'center'}}>

        <Text style={{color: '#fff'}}>{text1}</Text>

        <Image
          style={{ height: 30, width: 15, marginLeft: Dimensions.get("window").width / 3 }}
          source={require("../data/images/shrine.png")}
        />

        <Text style={{color: '#fff', marginLeft: 10}}>{shrineAmount}</Text>

        {this.renderButton()}

      </View>
    )
  }



  render() {
    const bar = this.getBar();
    return (
      <View>
        {bar}
      </View>
    );
  }
}

export default Bar;
