// Crypto Facilities Ltd REST API V3

// Copyright (c) 2019 Crypto Facilities

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the 'Software'),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
// IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const cf = require('./cfRestApiV3')

const baseUrl = 'https://www.cryptofacilities.com'

// api access variables are generated on your Account page under Settings -> API Keys
const apiKey = '...'
const apiSecret = '...'

const requestTimeoutMs = 5000
const cfRest = new cf.CfRestApiV3(baseUrl, apiKey, apiSecret, requestTimeoutMs)

let symbol

// get instruments
let instrumentsPromise = cfRest.getInstruments()

// get tickers
let tickerPromise = cfRest.getTickers()

// get orderbook
symbol = 'PI_XBTUSD'
let orderbookPromise = cfRest.getOrderbook(symbol)

// get history
symbol = 'PI_XBTUSD'
// let lastTime = '2019-02-16T23:19:12.121Z';
let historyPromise = cfRest.getHistory(symbol)

// get accounts
let accountsPromise = cfRest.getAccounts()

// send limit order
let orderType = 'lmt'
symbol = 'PI_XBTUSD'
let side = 'buy'
let size = 1
let limitPrice = 1.0
let clientId = 'my_client_id'
let sendOrderLimitPromise = cfRest.sendOrder(
  orderType,
  symbol,
  side,
  size,
  limitPrice,
  (clientOrderId = clientId)
)

// send stop order
orderType = 'stp'
symbol = 'PI_XBTUSD'
side = 'buy'
size = 1
limitPrice = 1.0
let stopPrice = 2.0
let sendOrderStopPromise = cfRest.sendOrder(
  orderType,
  symbol,
  side,
  size,
  limitPrice,
  stopPrice
)

// edit order
edit = { cliOrdId: 'my_client_id', size: 2, limitPrice: 2 }
let editOrderPromise = cfRest.editOrder(edit)

// batch order
let elementJson = {
  batchOrder: [
    {
      order: 'send',
      order_tag: '1',
      orderType: 'lmt',
      symbol: 'PI_XBTUSD',
      side: 'buy',
      size: 1,
      limitPrice: 1.0,
      cliOrdId: 'my_another_client_id',
    },
    {
      order: 'send',
      order_tag: '2',
      orderType: 'stp',
      symbol: 'PI_XBTUSD',
      side: 'buy',
      size: 1,
      limitPrice: 2.0,
      stopPrice: 3.0,
    },
    {
      order: 'cancel',
      order_id: 'e35d61dd-8a30-4d5f-a574-b5593ef0c050',
    },
    {
      order: 'cancel',
      cliOrdId: 'my_client_id',
    },
  ],
}
let batchOrderPromise = cfRest.batchOrder(elementJson)

// cancel order
let orderId = 'e35d61dd-8a30-4d5f-a574-b5593ef0c050'
let cancelOrderPromise = cfRest.cancelOrder(orderId)

// cancel all orders
symbol = 'PI_XBTUSD'
let cancelAllOrdersPromise = cfRest.cancelAllOrders(symbol)

//cancel all orders after
let timeoutSec = 10
let cancelAllOrdersAfterPromise = cfRest.cancelAllOrdersAfter(timeoutSec)

// get open orders
let openOrdersPromise = cfRest.getOpenOrders()

// get open positions
let openPositionsPromise = cfRest.getOpenPositions()

// get recent orders
let recentOrdersPromise = cfRest.getRecentOrders(symbol)

// get filled orders
let lastFillTime = '2019-02-16T23:19:12.121Z'
let fillsPromise = cfRest.getFills(lastFillTime)

// get transfers
let lastTransferTime = '2019-02-16T23:19:12.121Z'
let transfersPromise = cfRest.getTransfers(lastTransferTime)

// get notifications
let notificationsPromise = cfRest.getNotifications()

async function main() {
  const responses = await Promise.all([
    instrumentsPromise,
    tickerPromise,
    orderbookPromise,
    historyPromise,
    accountsPromise,
    sendOrderLimitPromise,
    sendOrderStopPromise,
    editOrderPromise,
    batchOrderPromise,
    cancelOrderPromise,
    cancelAllOrdersPromise,
    cancelAllOrdersAfterPromise,
    openOrdersPromise,
    openPositionsPromise,
    recentOrdersPromise,
    fillsPromise,
    transfersPromise,
    notificationsPromise,
  ])

  for (const response of responses) {
    console.log(response.name + '\n\t' + response.body)
  }
}

try {
  main()
} catch (err) {
  console.error('received ' + err)
}
