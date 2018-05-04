import React from 'react';
import PropTypes from 'prop-types';
import GridView from 'react-native-super-grid';
import { Text, View, TouchableHighlight, Dimensions } from 'react-native';
import styles from './styles';


// renderSeparator = () => {
//   return (
//     <View
//       style={{
//         height: 10,
//         width: "86%",
//         backgroundColor: "#ea2323",
//         marginLeft: "0%"
//       }}
//     />
//   );
// };

// renderHeader = () => {
//   return <Text>Header</Text>;
// };
//
// renderFooter = () => {
//   return <Text>Footer</Text>;
// };


const Grid = ({ items, itemDimension, gridDimension, onPress, header, footer }) => (
  <View style={{marginTop: 10, marginBottom: 0}}>
    <GridView

      ListHeaderComponent={header}
      ListFooterComponent={footer}

      spacing={0}
      staticDimension={gridDimension}

      itemDimension={itemDimension}
      items={items}

      style={{marginTop: 0, marginBottom: 0}}

      renderItem={item => (
        <TouchableHighlight
          onPress={() => onPress(item)}

        >

          <View style={{ backgroundColor: '#fff', borderWidth: 1, height: itemDimension}}>
            <Text>{item}</Text>
          </View>

        </TouchableHighlight>
      )}

    />
  </View>
);

// <GridView
//
//   containerStyle={{ borderTopWidth: 2, borderBottomWidth: 2 }}
//
//   style={styles.wrapper}


// extraData={Map({
//   items: items
// })}


Grid.propTypes = {
  items: PropTypes.array,
  itemDimension: PropTypes.number,
  gridDimension: PropTypes.number,
  onPress: PropTypes.func,
  header: PropTypes.func,
  footer: PropTypes.func

};

//      renderItem={({ item }) => (
//   <GridItem
//     text={9}
//     onPress={console.log(item)}
//   />
// )}


export default Grid;
