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

let crypto = require('crypto')
const utf8 = require('utf8')
let qs = require('querystring')

let request = require('request')

class CfRestApiV3 {
  constructor(baseUrl, apiKey, apiSecret, timeout) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.timeout = timeout
  }

  // ######################
  // ## public endpoints ##
  // ######################

  /**
   * Returns all instruments with specifications.
   */
  getInstruments() {
    let requestOptions = {
      url: this.baseUrl + '/derivatives/api/v3/instruments',
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getInstruments(): ')
  }

  /**
   * Returns market data for all instruments.
   */
  getTickers() {
    let requestOptions = {
      url: this.baseUrl + '/derivatives/api/v3/tickers',
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getTickers(): ')
  }

  /**
   * Returns the entire order book of a futures market.
   */
  getOrderbook(symbol) {
    let params = qs.stringify({ symbol: symbol })
    let requestOptions = {
      url: this.baseUrl + '/derivatives/api/v3/orderbook?' + params,
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getOrderbook(): ')
  }

  /**
   * Returns historical data for futures and indices.
   */
  getHistory(symbol, lastTime = null) {
    let params = { symbol: symbol }
    if (lastTime) {
      params[lastTime] = lastTime
    }
    let requestOptions = {
      url: this.baseUrl + '/derivatives/api/v3/history?' + qs.stringify(params),
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getHistory(): ')
  }

  // #######################
  // ## private endpoints ##
  // #######################

  /**
   * Returns key account information.
   */
  getAccounts() {
    let endpoint = '/derivatives/api/v3/accounts'
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
    }

    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'GET',
      headers: headers,
      timeout: this.timeout,
    }

    return makeRequest(requestOptions, 'getAccounts(): ')
  }

  /**
   * Send/place order.
   */
  sendOrder(
    orderType,
    symbol,
    side,
    size,
    limitPrice,
    stopPrice = null,
    clientOrderId = null
  ) {
    let endpoint = '/derivatives/api/v3/sendorder'
    let nonce = createNonce()
    let data = `orderType=${orderType}&symbol=${symbol}&side=${side}&size=${size}&limitPrice=${limitPrice}`
    if (stopPrice) data.concat(`&stopPrice=${stopPrice}`)
    if (clientOrderId) data.concat(`&cliOrdId=${clientOrderId}`)
    let authent = this.signRequest(endpoint, nonce, data)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'POST',
      headers: headers,
      body: data,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'sendOrder(): ')
  }

  /**
   * Edit order.
   */
  editOrder(edit) {
    let endpoint = '/derivatives/api/v3/editorder'
    let nonce = createNonce()
    let data = qs.encode(edit)
    let authent = this.signRequest(endpoint, nonce, data)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'POST',
      headers: headers,
      body: data,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'editOrder(): ')
  }

  /**
   * Cancel order.
   */
  cancelOrder(orderId, cliOrdId) {
    let endpoint = '/derivatives/api/v3/cancelorder'
    let data
    if (orderId) data = `order_id=${orderId}`
    else data = `cliOrdId=${cliOrdId}`
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce, data)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'POST',
      headers: headers,
      body: data,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'cancelOrder(): ')
  }

  /**
   * Cancel all orders.
   */
  cancelAllOrders(symbol = null) {
    let endpoint = '/derivatives/api/v3/cancelallorders'
    let data
    if (symbol) data = `symbol=${symbol}`
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce, data)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'POST',
      headers: headers,
      body: data,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'cancelAllOrders(): ')
  }

  /**
   * Cancel all orders after X seconds.
   */
  cancelAllOrdersAfter(timeout) {
    let endpoint = '/derivatives/api/v3/cancelallordersafter'
    let data
    if (timeout) data = `timeout=${timeout}`
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce, data)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'POST',
      headers: headers,
      body: data,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'cancelAllOrdersAfter(): ')
  }

  /**
   * Batch order.
   */
  batchOrder(elementJson) {
    let endpoint = '/derivatives/api/v3/batchorder'
    let data = `json=${JSON.stringify(elementJson)}`
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce, data)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'POST',
      headers: headers,
      body: data,
    }
    return makeRequest(requestOptions, 'batchOrder(): ')
  }

  /**
   * Returns all open orders.
   */
  getOpenOrders() {
    let endpoint = '/derivatives/api/v3/openorders'
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'GET',
      headers: headers,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getOpenOrders(): ')
  }

  /**
   * Returns all open positions.
   */
  getOpenPositions() {
    let endpoint = '/derivatives/api/v3/openpositions'
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'GET',
      headers: headers,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getOpenPositions(): ')
  }

  /**
   * Returns recent orders.
   */
  getRecentOrders(symbol = null) {
    let endpoint = '/derivatives/api/v3/recentorders'
    let params = symbol ? `symbol=${symbol}` : ''
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce, params)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
    }
    let requestOptions = {
      url: `${this.baseUrl}${endpoint}?${encodeURI(params)}`,
      method: 'GET',
      headers: headers,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getRecentOrders(): ')
  }

  /**
   * Returns filled orders.
   */
  getFills(lastFillTime = null) {
    let endpoint = '/derivatives/api/v3/fills'
    let params = lastFillTime ? `lastFillTime=${lastFillTime}` : ''
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce, params)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
    }
    let requestOptions = {
      url: `${this.baseUrl}${endpoint}?${encodeURI(params)}`,
      method: 'GET',
      headers: headers,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getFills(): ')
  }

  /**
   * Returns transfers.
   */
  getTransfers(lastTransferTime = null) {
    let endpoint = '/derivatives/api/v3/transfers'
    let nonce = createNonce()
    let params = lastTransferTime ? `lastTransferTime= ${lastTransferTime}` : ''
    let authent = this.signRequest(endpoint, nonce, params)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
    }
    let requestOptions = {
      url: `${this.baseUrl}${endpoint}?${encodeURI(params)}`,
      method: 'GET',
      headers: headers,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getTransfers(): ')
  }

  /**
   * Returns notifications.
   */
  getNotifications() {
    let endpoint = '/derivatives/api/v3/notifications'
    let nonce = createNonce()
    let authent = this.signRequest(endpoint, nonce)
    let headers = {
      Accept: 'application/json',
      APIKey: this.apiKey,
      Nonce: nonce,
      Authent: authent,
    }
    let requestOptions = {
      url: this.baseUrl + endpoint,
      method: 'GET',
      headers: headers,
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getNotifications(): ')
  }

  /**
   * Sign request.
   */
  signRequest(endpoint, nonce, postData = '') {
    // step 1: concatenate postData, nonce + endpoint
    if (endpoint.startsWith('/derivatives')) {
        endpoint = endpoint.slice('/derivatives'.length)
    }

    let message = postData + nonce + endpoint

    // Step 2: hash the result of step 1 with SHA256
    let hash = crypto.createHash('sha256').update(utf8.encode(message)).digest()

    // step 3: base64 decode apiPrivateKey
    let secretDecoded = Buffer.from(this.apiSecret, 'base64')

    // step 4: use result of step 3 to hash the result of step 2 with
    let hash2 = crypto.createHmac('sha512', secretDecoded).update(hash).digest()

    // step 5: base64 encode the result of step 4 and return
    return Buffer.from(hash2).toString('base64')
  }
}

function makeRequest(requestOptions, printName) {
  return new Promise((resolve, reject) => {
    request(requestOptions, function (error, response, body) {
      if (error) {
        reject(error)
      } else {
        resolve({ name: printName, body: body })
      }
    })
  })
}

// Generate nonce
let nonce = 0
function createNonce() {
  if (nonce === 9999) nonce = 0
  let timestamp = new Date().getTime()
  return timestamp + ('0000' + nonce++).slice(-5)
}

module.exports = {
  CfRestApiV3,
}
