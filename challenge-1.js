// https://docs.google.com/document/d/1LKP_LZMkpkGHvT6xzclMp1kl3pj1rJGFqflafNsDkaQ/edit#
const { getWeb3, isStableCoins, retry } = require('./utils')
const routerAbi = require('./router.json')

const Axios = require('axios').default


// Biggest swap on ETH until 18 May 2021: 0x6b1594e1a7aa3f2dfa3b00f8913745d961579d7e7e97950364cce11c02459d56
// Biggest swap on BSC until 18 May 2021: https://bscscan.com/tx/0xd58b583ccc04c2502828bd1d20a7d31f61806a839108cdad6ff2b19ca9a36fd9
async function findLargestSwapOn1InchV3(chainId = 1) {
  const web3 = getWeb3(chainId)
  const { routerV3, startBlock } = await get1InchInfos(chainId)

  const contract = new web3.eth.Contract(routerAbi, routerV3)
  const params = {
    filter: (event) => isStableCoins(event.returnValues.dstToken, chainId) || isStableCoins(event.returnValues.srcToken, chainId),
    fromBlock: startBlock,
  }

  const events = await getPastEvents(contract, 'Swapped', params, 5000, chainId)
  const swapValueSorted = events.sort((eventA, eventB) => {
    let amountA;
    let amountB;
    if (isStableCoins(eventA.returnValues.dstToken, chainId)) {
      amountA = eventA.returnValues.returnAmount;
    } else {
      amountA = eventA.returnValues.spentAmount;
    }

    if (isStableCoins(eventB.returnValues.dstToken, chainId)) {
      amountB = eventB.returnValues.returnAmount
    } else {
      amountB = eventB.returnValues.spentAmount
    }

    return parseInt(amountB) - parseInt(amountA)
  })

  console.log(swapValueSorted[0])
}

// 1inch aggregator v3 launch https://blog.1inch.io/introducing-the-1inch-aggregation-protocol-v3-b02890986547
async function get1InchInfos(chainId = 1, startDate = '2021-03-17') {
  if (chainId !== 56 && chainId !== 1) {
    throw new Error(`chainId ${chainId} is not supported.`)
  }
  const domain = chainId === 1 ? 'etherscan' : 'bscscan'
  const apikey = chainId === 1 ? 'VCKWHFAA6M5AR8SFVXC43DEMEA8JN2H3WZ' : 'X878A9QFMVJV5D3EWS141XSN4BYBVCFXKN'

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

findLargestSwapOn1InchV3(56)
