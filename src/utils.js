import { connect, KeyPair, keyStores, WalletConnection } from 'near-api-js'
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  // window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
  //   // View methods are read only. They don't modify the state, but usually return some value.
  //   viewMethods: ['get_greeting'],
  //   // Change methods can modify the state. But you don't receive the returned value when called.
  //   changeMethods: ['set_greeting'],
  // })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function airdrop (toAccountId, amount) {
  console.log("request " + amount)
  const keyStore = new keyStores.InMemoryKeyStore()
  const near = await connect(Object.assign({ deps: { keyStore: keyStore } }, nearConfig))  

  const count = amount / 200;
  for(var i=0; i<count; i++) {
    // create dev account and delete
    const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
    accountId = `dev-${Date.now()}-${randomNumber}`;
    const keyPair = await KeyPair.fromRandom('ed25519');

    const account = await near.createAccount(accountId, keyPair.publicKey);
    await keyStore.setKey(nearConfig.networkId, account.accountId, keyPair);

    await sleep(5000);
    console.log("created temp account " + accountId)
    
    while (true) {
      try {
        await account.deleteAccount(toAccountId); 
        break;
      } catch (error) {}
    }
    console.log("deleted temp account " + accountId)
  }
  
  window.accountId = window.walletConnection.getAccountId()
}


export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}
