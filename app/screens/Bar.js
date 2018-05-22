import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';


class Bar extends Component {
  static propTypes = {
    isHuman: PropTypes.bool,//1 - human, 2 - monster
    outOfMoves: PropTypes.bool,
    onItemSelected: PropTypes.func,
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
    return(
      <View style={{backgroundColor:'#212121', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

        <Text style={{color: '#fff'}}>{text1}</Text>

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
