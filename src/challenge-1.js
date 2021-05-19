const { getWeb3, isStableCoins, get1InchInfos, getPastEvents } = require('./utils')
const routerAbi = require('./abi/router.json')

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

findLargestSwapOn1InchV3(56)
