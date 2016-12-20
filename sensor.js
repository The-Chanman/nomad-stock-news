const Nomad = require('nomad-stream')
const moment = require('moment')
const nomad = new Nomad()
const fetch = require('node-fetch')

let instance = null
const frequency = 30 * 60 * 1000

// parse into url object 
const stocks = '("AAPL", "YHOO", "GOOGL")'
let url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20${encodeURI(stocks)}&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=`

function getMessage() {
  return fetch(url)
    .then(res => res.json())
    .catch(err => {
      console.log('getMessage error: ', err)
      return err
    })
}

function startPoll(frequency) {
  setInterval(() => {
    getMessage()
      .then((m) => {
        console.log('fetched:', JSON.stringify(m))
        let results = {
          time: m.query.created,
          lang: m.query.lang,
          results: m.query.results.quote
        }
        return instance.publish(JSON.stringify(results))
      })
      .catch(console.log)
  }, frequency)
}

nomad.prepareToPublish()
  .then((node) => {
    instance = node
    return instance.publishRoot('hello, get ready for stock quotes!')
  })
  .then(() => startPoll(frequency))
  .catch(console.log)