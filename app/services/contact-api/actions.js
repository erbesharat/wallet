/**
 * @format
 */

import Logger from 'react-native-file-log'
import { Constants, Schema } from 'shock-common'
import Http from 'axios'
import { ToastAndroid } from 'react-native'

import * as Cache from '../../services/cache'

import * as Events from './events'
import { socket } from './socket'

const { Action } = Constants

/**
 * @throws {Error} If no data is cached.
 * @returns {Promise<string>}
 */
const getToken = async () => {
  const authData = await Cache.getStoredAuthData()

  if (authData === null) {
    throw new Error('Subscribed to event without having auth data cached.')
  }

  return authData.authData.token
}

/**
 * @param {string} requestID
 * @returns {Promise<void>}
 */
export const acceptRequest = async requestID => {
  try {
    await Http.put(`api/gun/requests/${requestID}`, {
      accept: true,
    })
  } catch (e) {
    Logger.log(e)
    throw e
  }
}

/**
 * @returns {Promise<void>}
 */
export const generateNewHandshakeNode = () => {
  return getToken().then(token => {
    if (!socket || !(socket && socket.connected)) {
      throw new Error('NOT_CONNECTED')
    }

    socket.emit(Action.GENERATE_NEW_HANDSHAKE_NODE, {
      token,
    })
  })
}

/**
 * @param {string} avatar
 * @returns {Promise<void>}
 */
export const setAvatar = async avatar => {
  try {
    await Http.put(`/api/gun/me`, {
      avatar,
    })
  } catch (err) {
    Logger.log(err)
    ToastAndroid.show(`Could not set avatar: ${err.message}`, ToastAndroid.LONG)
    throw err
  }
}

/**
 * @param {string} displayName
 * @returns {Promise<void>}
 */
export const setDisplayName = async displayName => {
  try {
    await Http.put(`/api/gun/me`, {
      displayName,
    })
  } catch (err) {
    Logger.log(err)
    ToastAndroid.show(
      `Could not set display name: ${err.message}`,
      ToastAndroid.LONG,
    )
    throw err
  }
}

/**
 * @param {string} recipientPublicKey
 * @returns {Promise<void>}
 */
export const sendHandshakeRequest = async recipientPublicKey => {
  try {
    return await Http.post(`api/gun/requests`, {
      publicKey: recipientPublicKey,
    })
  } catch (e) {
    Logger.log(e)
    throw e
  }
}

/**
 * Returns the message id.
 * @param {string} recipientPublicKey
 * @param {string} body
 * @returns {Promise<Schema.ChatMessage>} The message id.
 */
export const sendMessageNew = async (recipientPublicKey, body) => {
  try {
    return await Http.post(`api/gun/chats/${recipientPublicKey}`, {
      body,
    })
  } catch (err) {
    Logger.log(err)
    throw err
  }
}

/**
 * Returns the message id.
 * @param {string} recipientPublicKey
 * @param {string} body
 * @returns {Promise<string>} The message id.
 */
export const sendMessage = async (recipientPublicKey, body) =>
  (await sendMessageNew(recipientPublicKey, body)).id

/**
 * @param {string} recipientPublicKey
 * @param {string} initialMsg
 * @throws {Error} Forwards an error if any from the API.
 * @returns {Promise<void>}
 */
export const sendReqWithInitialMsg = async (recipientPublicKey, initialMsg) => {
  try {
    return await Http.post(`api/gun/requests`, {
      publicKey: recipientPublicKey,
      initialMsg,
    })
  } catch (e) {
    Logger.log(e)
    throw e
  }
}

/**
 * Returns the preimage corresponding to the payment.
 * @param {string} recipientPub
 * @param {number|string} amount
 * @param {string} memo
 * @param {{absoluteFee:string,relativeFee:string}} fees
 * @throws {Error} Forwards an error if any from the API.
 * @returns {Promise<string>} The payment's preimage.
 */
export const sendPayment = async (recipientPub, amount, memo, fees) => {
  const { absoluteFee, relativeFee } = fees
  const relFeeN = Number(relativeFee)
  const absFeeN = Number(absoluteFee)
  if (!relFeeN || !absFeeN) {
    throw new Error('invalid fees provided')
  }
  const amountN = Number(amount)
  const calculatedFeeLimit = Math.floor(amountN * relFeeN + absFeeN)
  const feeLimit = calculatedFeeLimit > amountN ? amountN : calculatedFeeLimit

  const sessionUuid = Date.now().toString()
  const endpoint = `/api/gun/sendpayment`
  const { data } = await Http.post(
    endpoint,
    {
      recipientPub,
      amount: amountN,
      memo,
      feeLimit,
      sessionUuid,
    },
    { timeout: 30 * 1000 },
  )
  const { preimage } = data
  Logger.log(`res in sendPayment: ${JSON.stringify(data)}`)

  return preimage
}

/**
 * @param {string} bio
 * @returns {Promise<void>}
 */
export const setBio = async bio => {
  try {
    await Http.put(`/api/gun/me`, {
      bio,
    })
  } catch (err) {
    Logger.log(err)
    ToastAndroid.show(`Could not set bio: ${err.message}`, ToastAndroid.LONG)
    throw err
  }
}

/**
 * @param {string} pub
 * @throws {Error}
 * @returns {Promise<void>}
 */
export const disconnect = async pub => {
  try {
    const chatIdx = Events.currentChats.findIndex(
      c => c.recipientPublicKey === pub,
    )

    /** @type {Schema.Chat[]} */
    let deletedChat = []

    // it's fine if it doesn't exist in our cache
    if (chatIdx !== -1) {
      const currChats = Events.getCurrChats()
      deletedChat = currChats.splice(chatIdx, 1)
      Events.setChats(currChats)
    }

    const res = await Http.delete(`api/gun/chats/${pub}`)

    if (res.status !== 200) {
      if (deletedChat.length) {
        Events.setChats([...Events.getCurrChats(), deletedChat[0]])
      }
      throw new Error(res.data.errorMessage || 'Unknown Error')
    }
  } catch (e) {
    Logger.log(e)
    throw e
  }
}

/**
 * @param {string} publicKey
 * @returns {Promise<void>}
 */
export const follow = async publicKey => {
  try {
    // TODO: Actual body
    const res = await Http.put(`/api/gun/follows/${publicKey}`, {})

    if (res.status !== 200) {
      throw new Error(res.data.errorMessage)
    }
  } catch (err) {
    throw new Error(
      `Could not follow publicKey: ${publicKey} due to : ${err.message ||
        'Unknown Error (Did not receive msg from server)'}`,
    )
  }
}

/**
 * @param {string} publicKey
 * @returns {Promise<void>}
 */
export const unfollow = async publicKey => {
  try {
    const res = await Http.delete(`/api/gun/follows/${publicKey}`)

    if (res.status !== 200) {
      throw new Error(res.data.errorMessage)
    }
  } catch (err) {
    throw new Error(
      `Could not UN-follow publicKey: ${publicKey} due to : ${err.message ||
        'Unknown Error (Did not receive msg from server)'}`,
    )
  }
}

/**
 * @param {object} post
 * @returns {Promise<{data:string}>}
 */
export const addPost = post => {
  return Http.post('/api/gun/addpost', { post })
}
