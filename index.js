const Web3 = require("web3")
const abi = require("./1inch.json")
const erc20 = require("./erc20.json")

const PROVIDER = "https://mainnet.infura.io/v3/a3a667b533f34fd48ca350546454ea05"

async function findBiggestStake() {
  const web3 = new Web3(PROVIDER);
  const contract = new web3.eth.Contract(abi, "0xe65184b402376703adc27a7d7e0e8d35a264a240");
  const events = await contract.getPastEvents('Staked', {
    fromBlock: 12150245,
    toBlock: 12344944
  })
  const sortedStaked = events.sort((a, b) => parseInt(b.returnValues.amount) - parseInt(a.returnValues.amount))
  console.log(sortedStaked[0])
}

async function findBiggestTransfer() {
  const web3 = new Web3(PROVIDER);
  const contract = new web3.eth.Contract(erc20, "0x111111111117dc0aa78b770fa6a738034120c302")
  const toBlock = 12344944
  let maxTransfer = 0
  let untilBlock = 12250000
  let fromBlock = 12241312
  let biggestTransfer = null
  while (untilBlock < 12344944) {
    const events = await contract.getPastEvents('Transfer', {
      filter: { from: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8" },
      fromBlock,
      toBlock: untilBlock
    }).then(transfers => transfers.map(transfer => transfer.returnValues))
    const sortedTransfers = events.sort((a, b) => parseInt(b.value) - parseInt(a.value))
    if (parseInt(sortedTransfers[0].value) > maxTransfer) {
      maxTransfer = parseInt(sortedTransfers[0].value)
      biggestTransfer = sortedTransfers[0]
    }
    console.log(`Biggest Transfer from ${fromBlock} to block ${untilBlock}:`, maxTransfer)
    fromBlock = untilBlock + 1
    untilBlock = Math.min(untilBlock + 10000, toBlock)
  }
  console.log(biggestTransfer);
}

findBiggestTransfer()
// findBiggestStake()
