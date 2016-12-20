const Nomad = require('nomad-stream')
const moment = require('moment')
const nomad = new Nomad()
const fetch = require('node-fetch')

let keep = {
  link: 1,
  pubDate: 1,
  title: 1
}
let results = {}
let instance = null
const frequency = 30 * 60 * 1000

// parse into url object 
const searchQuery = ['apple', 'yahoo', 'google']
let url = [`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Fnews%2Fsection%3Fq%3D${searchQuery[0]}%26output%3DRSS`, 
`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Fnews%2Fsection%3Fq%3D${searchQuery[1]}%26output%3DRSS`,
`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Fnews%2Fsection%3Fq%3D${searchQuery[2]}%26output%3DRSS`]

function getMessage(index) {
  return fetch(url[index])
    .then(res => res.json())
    .catch(err => {
      console.log('getMessage error: ', err)
      return err
    })
}

function startPoll(frequency) {
  setInterval(() => {
    getMessage(0)
      .then((m) => {
        // console.log('fetched:', JSON.stringify(m))
        setTimeout(() => {
          results[searchQuery[0]] = m
        }, 10000)
        return getMessage(1)
      })
      .then((m) => {
        // console.log('fetched:', JSON.stringify(m))
        setTimeout(() => {
          results[searchQuery[1]] = m
        }, 10000)
        return getMessage(2)
      })
      .then((m) => {
        // console.log('fetched:', JSON.stringify(m))
        setTimeout(() => {
          results[searchQuery[2]] = m
        }, 10000)

      for (var key in results) {
        if (!results.hasOwnProperty(key)) { continue }
        for (var prop in results[key]["items"]){
          for (var value in results[key]["items"][prop]) {
            if (!keep[value]){
              delete results[key]["items"][prop][value]
            }
            if (value == "link"){
              let urlIndex = results[key]["items"][prop]["link"].indexOf("url=")
              results[key]["items"][prop]["link"] = results[key]["items"][prop]["link"].substring(urlIndex+4)
            }
          }
        }
      }
      console.log(JSON.stringify(results))
      return instance.publish(JSON.stringify(results))
      })
      .catch(console.log)
  }, frequency)
}

nomad.prepareToPublish()
  .then((node) => {
    instance = node
    return instance.publishRoot('hello, get ready for stock news!')
  })
  .then(() => startPoll(frequency))
  .catch(console.log)