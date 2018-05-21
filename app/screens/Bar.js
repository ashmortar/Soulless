import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';

import { Container } from '../components/Container';
import { NavButton } from '../components/Button';
import { Header } from '../components/Header';
import { Blurb } from '../components/Blurb';


class Bar extends Component {
  static propTypes = {
    mode: PropTypes.number,//0 - settings, 1 - human, 2 - monster
    onItemSelected: PropTypes.func,
  }



  getBar = () => {
    return(
      <View style={{backgroundColor:'#555', padding: 10}}>
        <View style={{alignItems: 'flex-start'}}>
          <Text>HEY</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <TouchableOpacity onPress={()=>{console.log('pressed');}}>
            <View style={{    padding: 10,
                borderRadius: 15,
                borderColor: '#d94400',
                borderWidth: 2,
                backgroundColor: '#000' }}>
              <Text style={{ color: '#fff' }}>hey</Text>
            </View>
          </TouchableOpacity>
        </View>
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
