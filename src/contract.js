const { getWeb3, retry } = require('./utils')
require('dotenv').config()

const Axios = require('axios').default

// 1inch aggregator v3 launch https://blog.1inch.io/introducing-the-1inch-aggregation-protocol-v3-b02890986547
async function get1InchInfos(chainId = 1, startDate = '2021-03-17') {
  if (chainId !== 56 && chainId !== 1) {
    throw new Error(`chainId ${chainId} is not supported.`)
  }
  const domain = chainId === 1 ? 'etherscan' : 'bscscan'
  const apikey = chainId === 1 ? process.env.ETH_API_KEY : process.env.BSC_API_KEY

  const routerV3 = "0x11111112542D85B3EF69AE05771c2dCCff4fAa26"
  const startBlock = await Axios.get(`https://api.${domain}.com/api?module=block&action=getblocknobytime`, {
    params: {
      timestamp: new Date(startDate).getTime() / 1000,
      closest: 'after',
      apikey
    }
  }).then(result => parseInt(result.data.result))
  return { routerV3, startBlock }

}

async function getPastEvents(contract, event, params, eventsPerRound = 10000, chainId = 1) {
  const web3 = getWeb3(chainId)
  const latestBlock = params.toBlock || await web3.eth.getBlockNumber()
  let _toBlock = Math.min(params.fromBlock + eventsPerRound, latestBlock)
  let _fromBlock = params.fromBlock
  let events = []
  while (_toBlock < latestBlock) {
    let _events;
    _events = await retry(async () => {
      return contract.getPastEvents(event, {
        fromBlock: _fromBlock,
        toBlock: _toBlock
      })
    })

    const filtered_events = _events.filter(params.filter)

    events = events.concat(filtered_events)
    console.log(`Blocks processed: ${_toBlock}/${latestBlock}`)

    _fromBlock = _toBlock + 1
    _toBlock = Math.min(_toBlock + eventsPerRound, latestBlock)
  }
  return events
}

module.exports = {
  get1InchInfos,
  getPastEvents
}
