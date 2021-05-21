const { getWeb3, isStableCoins } = require('./utils')
const { get1InchInfos, getPastEvents } = require('./contract')
const { sort1InchSwapStablecoinValue } = require('./sort')
const routerAbi = require('./abi/router.json')

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
  const [biggestTx] = sort1InchSwapStablecoinValue(events, chainId)

  console.log(biggestTx)
}

findLargestSwapOn1InchV3(56)
