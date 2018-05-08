import React from 'react';
import PropTypes from 'prop-types';
import GridView from 'react-native-super-grid';
import { Text, View, TouchableHighlight, ScrollView } from 'react-native';

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

const Grid = ({ items, itemDimension, gridDimension, onPress, header, footer}) => (
  <View style={{marginTop: 10, marginBottom: 0, justifyContent: 'flex-start'}}>
  <ScrollView horizontal={true}>
    <GridView

      ListHeaderComponent={header}
      ListFooterComponent={footer}

      spacing={0}

      style={{width: gridDimension}}

      itemDimension={itemDimension}
      items={items}

      fixed={true}

      renderItem={item => (
        <TouchableHighlight
          onPress={() => onPress(item)}
        >

          <View style={item.value ?
            { backgroundColor: '#fff', borderWidth: 0.5, height: itemDimension } :
            { backgroundColor: '#000', borderWidth: 0.5, height: itemDimension }}>
            <Text style={item.highlighted ? { color: '#fff', fontSize: itemDimension * 0.6 } : {fontSize: itemDimension * 0.6}}>{item.value}</Text>
          </View>

        </TouchableHighlight>
      )}

    />
  </ScrollView>
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
