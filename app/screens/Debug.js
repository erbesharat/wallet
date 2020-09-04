import React from 'react'
import { Clipboard, View, Button, Text, ToastAndroid } from 'react-native'
import { connect } from 'react-redux'
import { Constants } from 'shock-common'

import * as CSS from '../res/css'
import * as Cache from '../services/cache'
import { Actions, Events, Socket } from '../services/contact-api'
import * as Navigation from '../services/navigation'
import { CONNECT_TO_NODE } from '../screens/ConnectToNode'

import QR from './WalletOverview/QR'

const { Action } = Constants
const { SET_LAST_SEEN_APP } = Action

export const DEBUG = 'DEBUG'

/**
 * @typedef {object} Props
 * @prop {string} deviceID
 */

/** @augments React.Component<Props, Record<string, any>> */
class Debug extends React.Component {
  state = {
    addr: Events.getHandshakeAddr(),
    chats: [],
    sreqs: [],
    rreqs: [],
    pk: '',
    token: '',
    socketConnected: false,
    lastPing: Date.now() - 10000,
  }

  subs = [() => {}]

  onSocketRes = () => {
    this.mounted &&
      this.setState({
        lastPing: Date.now(),
      })
  }

  setupSub = () => {
    if (Socket.socket) {
      Socket.socket.on(SET_LAST_SEEN_APP, this.onSocketRes)
    }
  }

  componentDidMount() {
    this.mounted = true

    this.setupSub()

    this.subs.push(
      Events.onHandshakeAddr(addr => this.setState({ addr })),
      Events.onChats(chats => this.setState({ chats })),
      Events.onSentRequests(sreqs => this.setState({ sreqs })),
      Events.onReceivedRequests(rreqs => this.setState({ rreqs })),

      (() => {
        const intervalID = setInterval(() => {
          this.mounted &&
            this.setState({
              socketConnected: Socket.socket && Socket.socket.connected,
            })
        }, 1000)

        return () => {
          clearInterval(intervalID)
        }
      })(),

      () => {
        Socket.socket && Socket.socket.off(SET_LAST_SEEN_APP, this.onSocketRes)
      },
    )

    Cache.getToken().then(token => {
      this.mounted &&
        this.setState({
          token,
        })
    })

    Cache.getStoredAuthData().then(ad => {
      ad &&
        this.mounted &&
        this.setState({
          pk: ad.authData.publicKey,
        })
    })
  }

  componentWillUnmount() {
    this.mounted = false
    this.subs.forEach(s => s())
  }

  copyDeviceID = () => {
    Clipboard.setString(this.props.deviceID)
    ToastAndroid.show('Copied', 800)
  }

  copyToken = () => {
    Clipboard.setString(this.state.token)
    ToastAndroid.show('Copied', 800)
  }

  sendSentReqsEvent = async () => {
    Socket.socket &&
      Socket.socket.emit('ON_SENT_REQUESTS', {
        token: await Cache.getToken(),
      })
  }

  connectSocket = () => {
    Socket.connect().then(this.setupSub)
  }

  clearAuthData = () => {
    Cache.writeStoredAuthData(null)
  }

  clearAllStorage = async () => {
    await Cache.clearAllStorage()

    Navigation.navigate(CONNECT_TO_NODE)
  }

  render() {
    const { lastPing } = this.state

    const isBetterConnected = Date.now() - lastPing < 5000

    return (
      <View style={[CSS.styles.deadCenter, CSS.styles.flex]}>
        <Text>A random number:</Text>
        <Text>{Math.random().toString()}</Text>

        <Text>Current Socket Status:</Text>
        <Text>{this.state.socketConnected ? 'Connected' : 'Disconnected'}</Text>

        <Text>Better Socket Status:</Text>
        <Text>{isBetterConnected ? 'Connected' : 'Disconnected'}</Text>

        <Text>Current Handshake Address:</Text>
        <Text>{this.state.addr}</Text>

        <Text>Current Chats:</Text>
        <Text>{this.state.chats.length}</Text>

        <Text>Current Sent reqs:</Text>
        <Text>{this.state.sreqs.length}</Text>

        <Text>Current Received reqs:</Text>
        <Text>{this.state.rreqs.length}</Text>

        <Text>Device ID:</Text>
        <Text>{this.props.deviceID}</Text>

        <Text>Token:</Text>
        <Text>{this.state.token}</Text>

        <Button title="Connect Socket" onPress={this.connectSocket} />
        <Button title="Disconnect Socket" onPress={Socket.disconnect} />
        <Button title="Clear AUTH Data" onPress={this.clearAuthData} />

        <Button
          title="Copy device id to clipboard"
          onPress={this.copyDeviceID}
        />

        <Button title="Copy token to clipboard" onPress={this.copyToken} />

        <Button
          title="New Handshake Address"
          onPress={Actions.generateNewHandshakeNode}
        />

        <Button
          title="Send Sent Requests Event"
          onPress={this.sendSentReqsEvent}
        />

        <Button title="CLEAR ALL STORAGE" onPress={this.clearAllStorage} />

        <QR
          size={256}
          logoToShow="shock"
          value={`$$__SHOCKWALLET__USER__${this.state.pk}`}
        />
      </View>
    )
  }
}

// @ts-ignore
const mapStateToProps = ({ connection }) => ({
  deviceID: connection.deviceId,
})

export default connect(mapStateToProps)(Debug)
