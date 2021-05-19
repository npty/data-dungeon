const Web3 = require('web3')

function getWeb3(chainId = 1) {
  let provider
  if (chainId === 1) {
    provider = "https://mainnet.infura.io/v3/a3a667b533f34fd48ca350546454ea05"
  } else if (chainId === 56) {
    provider = "https://bsc-dataseed.binance.org/"
  } else {
    throw new Error(`ChainId ${chainId} is not supported.`)
  }
  return new Web3(provider)
}

async function retry(operation, retryCount = 1, maxRetries = 10) {
  try {
    const result = await operation()
    return result
  } catch (e) {
    if (retryCount < maxRetries) {
      return retry(operation, retryCount + 1, maxRetries)
    } else {
      throw new Error('Exceed maximum retries count', maxRetries)
    }
  }
}

function isStableCoins(token, chainId = 1) {
  let stablecoins = []
  if (chainId === 1) {
    const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
    stablecoins = [USDT, USDC, DAI]
  } else if (chainId === 56) {
    const USDT = "0x55d398326f99059ff775485246999027b3197955"
    const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
    const DAI = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3"
    const BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56"
    stablecoins = [USDT, USDC, DAI, BUSD]
  } else {
    throw new Error(`ChainId ${chainId} is not supported.`)
  }
  return stablecoins.indexOf(token.toLowerCase()) > -1
}

module.exports = {
  getWeb3,
  isStableCoins,
  retry,
}
