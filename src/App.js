import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout, airdrop } from './utils'
import './global.css'
import * as nearAPI from "near-api-js";
const { utils } = nearAPI;

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  const [balance, setBalance] = React.useState(0)

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {
        window.walletConnection.account().getAccountBalance()
        .then(balance => {
          setBalance(balance)
        });
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR testnet Faucet!</h1>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          {window.accountId} Balance: 
          <br/>
          {utils.format.formatNearAmount(balance.available, 5)} NEAR
        </h1>
        <form onSubmit={async event => {
          event.preventDefault()

          setButtonDisabled(true)
          // get elements from the form using their id attribute
          const { nearAmount } = event.target.elements

          // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const requestAmt = nearAmount.value

          try {
            await airdrop(window.accountId, requestAmt)
          } catch (e) {
            alert(e)
          } finally {
            setButtonDisabled(false)
            window.walletConnection.account().getAccountBalance()
            .then(balance => {
              setBalance(balance)
            });            
          }
        }}>
          <fieldset id="fieldset">
            <label
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Request
            </label>
            <div style={{ display: 'flex' }}>
            <select id="nearAmount">
                <option value="200">200 NEAR</option>
                <option value="400">400 NEAR</option>
                <option value="600">600 NEAR</option>
                <option value="800">800 NEAR</option>
                <option value="1000">1000 NEAR</option>
            </select>              
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Submit
              </button>
            </div>
          </fieldset>
        </form>
      </main>
    </>
  )
}

