import React, { Component } from 'react'
import { DrawerItems } from 'react-navigation'
import { View, StyleSheet } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { LNURL_SCREEN } from '../screens/LNURL'
// import ShockAvatar from './ShockAvatar'
import Pad from './Pad'

/**
 * @typedef {import('react-navigation').DrawerItemsProps} DrawerItemsProps
 */
/**
 * @extends Component<DrawerItemsProps>
 */
export default class CustomDrawer extends Component {
  moveToQr = () => {
    this.props.navigation.navigate(LNURL_SCREEN, { qrRequest: true })
  }

  moveToClip = () => {
    this.props.navigation.navigate(LNURL_SCREEN, { clipboardRequest: true })
  }

  render() {
    return (
      // <View style={styles.flexBetween}>
      <View style={styles.flexBetweenDark}>
        <Pad amount={50} />
        <DrawerItems {...this.props} labelStyle={styles.drawItemLabelDark} />
        <View style={styles.extraBit}>
          <AntDesign
            name="qrcode"
            size={25}
            style={styles.icon}
            onPress={this.moveToQr}
          />
          <AntDesign
            name="copy1"
            size={25}
            style={styles.icon}
            onPress={this.moveToClip}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  // flexBetween: {
  //   display: 'flex',
  //   flexDirection: 'column',
  //   justifyContent: 'space-between',
  //   height: '100%',
  // },
  drawItemLabelDark: {
    color: '#ffffff',
    textAlign: 'right',
  },
  flexBetweenDark: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    backgroundColor: '#16191c',
  },
  extraBit: {
    margin: 3,
    display: 'flex',
    flexDirection: 'row',
  },
  icon: {
    margin: 5,
  },
})
