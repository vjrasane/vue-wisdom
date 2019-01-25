const { keys, shuffle } = require('lodash')
const express = require('express')
const morgan = require('morgan')
const axios = require('axios')
const server = express()

require('dotenv').config()
const { API_KEY, URL } = process.env

const fetchQuotes = async () => {
  const response = await axios.get(URL, {
    headers: { Authorization: `Token token="${API_KEY}"` }
  })
  return response.data.quotes
}

const splitVerbs = {
  'there is': ['there is'],
  'there are': ['there are'],
  'it is': ['it is'],
  are: ['are'],
  has: ['has'],
  have: ['have'],
  will: ['will', 'can'],
  can: ['will', 'can']
}

const pad = str => ` ${str} `

const splitQuote = (quote, verb, indexer = (q, v) => q.lastIndexOf(v)) => {
  const index = indexer(quote, verb)
  if (index >= 0) {
    return [
      quote.slice(0, index + verb.length),
      verb.trim(),
      quote.slice(index + verb.length)
    ]
  }
}

const getQuote = async () => {
  let quotes = []
  let quote
  let startSplit
  while (!startSplit) {
    quotes = quotes.length ? quotes : await fetchQuotes()
    quote = quotes.pop()
    const verb = keys(splitVerbs).find(v => quote.body.indexOf(pad(v)) > 0)
    startSplit = splitQuote(quote.body, pad(verb), (q, v) => q.indexOf(v))
  }

  let endSplit
  let verbs = splitVerbs[startSplit[1]]
  while (!endSplit) {
    quotes = quotes.length ? quotes : await fetchQuotes()
    quote = quotes.pop()
    const verb = shuffle(verbs).find(v => quote.body.indexOf(pad(v)) > 0)
    endSplit = splitQuote(quote.body, pad(verb))
  }

  return { quote: [startSplit[0].trim(), endSplit[2]].join(' '), author: quote.author }
}

server.get('/api', async (req, res) => {
  res.send(await getQuote())
})

server.use(
  morgan(':method :url :status :res[content-length] - :response-time ms')
)

process.env.NODE_ENV === 'production' && server.use(express.static('dist'))

server.listen(3000, () => console.log('Server listening on port 3000'))
