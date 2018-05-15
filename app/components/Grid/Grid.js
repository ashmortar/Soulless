import React from 'react';
import PropTypes from 'prop-types';
import GridView from 'react-native-super-grid';
import { Text, View, TouchableHighlight, ScrollView } from 'react-native';

const Grid = ({
  items,
  itemDimension,
  gridDimension,
  onPress,
  header,
  footer,
  getCellStyle,
}) => (
  <View
    style={{ marginTop: 10, marginBottom: 0, justifyContent: "flex-start" }}
  >
    <ScrollView horizontal={true}>
      <GridView
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        spacing={0}
        style={{ width: gridDimension }}
        itemDimension={itemDimension}
        items={items}
        fixed={true}
        renderItem={item => (
          <TouchableHighlight onPress={() => onPress(item)}>
            <View
              style={
                getCellStyle(item)
              }
            >
              <Text style={{ fontSize: itemDimension * 0.4, textAlign: 'center' }}>{item.name}</Text>

            </View>
          </TouchableHighlight>
        )}
      />
    </ScrollView>
  </View>
);
// <Text style={{ fontSize: itemDimension * 0.6, textAlign: 'center' }}>{item.hasHuman ? 'H' : null}{item.hasMonster ? 'M' : null}{item.hasCache ? 'C' : null}</Text>



// <View
//   style={
//     item.value
//       ? {
//           backgroundColor: "#fff",
//           borderWidth: 0.5,
//           height: itemDimension
//         }
//       : {
//           backgroundColor: "#000",
//           borderWidth: 0.5,
//           height: itemDimension
//         }
//
//   }
// >


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
  footer: PropTypes.func,
  getCellStyle: PropTypes.func

};


//      renderItem={({ item }) => (
//   <GridItem
//     text={9}
//     onPress={console.log(item)}
//   />
// )}


export default Grid;
