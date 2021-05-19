function sort1InchSwapStablecoinValue(events, sortDir = 'desc') {
  return events.sort((eventA, eventB) => {
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

    if (sortDir === 'desc') {
      return parseInt(amountB) - parseInt(amountA)
    } else {
      return parseInt(amountA) - parseInt(amountB)
    }
  })
}

module.exports = {
  sort1InchSwapStablecoinValue
}
