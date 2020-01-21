
# ShockWallet Alpha

ShockWallet connects to a remote node and leverages [GUN](https://github.com/amark/gun) for a decentralized social layer.

Requires [Shock API](https://github.com/shocknet/api) backend, and [LND](https://github.com/lightningnetwork/lnd)

## Features:

- Provider-less mobile notifications
- LNURL Pay, Withdraw, Channel
- GUN Identities
- Private Encrypted Messaging
- SendSide Payments
- Invoice Auto-Responder


## [Download Android APK](https://github.com/shocknet/wallet/releases/download/pre1/APK-RELEASE.apk)

_Node installer available at [shocknet/Wizard](https://github.com/shocknet/wizard)_


### Build from source

#### Android: 

Requires Android Studio and React-Native CLI

```
git clone https://github.com/shocknet/wallet
cd wallet
yarn install
react-native run-android //to run in Android Studio emulator
npm run build:release //to build APK
```

#### iOS:

Help Wanted

<hr></hr>

**If you find any issues with this project, or would like to suggest an enhancement, please [tell us](https://github.com/shocknet/Wizard/issues).**

[ISC License](https://opensource.org/licenses/ISC)
© 2020 [Shock Network, Inc.](http://shock.network)
