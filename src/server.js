const express = require('express')
const morgan = require('morgan')
const axios = require('axios')
const server = express()

require('dotenv').config()
const {
  API_KEY,
  URL,
  PORT = 3000,
  SPLIT = 'there is,there are,it is,are,will,can',
  MAX_RETRIES = 20
} = process.env

const splitVerbs = SPLIT.split(',')

const fetchQuotes = async () => {
  const response = await axios.get(URL, {
    headers: { Authorization: `Token token="${API_KEY}"` }
  })
  return response.data.quotes
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

const NO_QUOTE = { quote: 'Out of quotes', author: 'Professional Quotemaker' }

const getQuote = async () => {
  let quotes = []
  let quote, verb, startSplit
  let retries = 0
  while (!startSplit) {
    if (retries >= MAX_RETRIES) return NO_QUOTE
    quotes = quotes.length ? quotes : await fetchQuotes()
    quote = quotes.pop()
    verb = splitVerbs.find(v => quote.body.indexOf(pad(v)) > 0)
    startSplit = splitQuote(quote.body, pad(verb), (q, v) => q.indexOf(v))
    retries += 1
  }

  retries = 0
  let endSplit
  while (!endSplit) {
    if (retries >= MAX_RETRIES) return NO_QUOTE
    quotes = quotes.length ? quotes : await fetchQuotes()
    quote = quotes.pop()
    endSplit = splitQuote(quote.body, pad(verb))
    retries += 1
  }

  return {
    quote: [startSplit[0].trim(), endSplit[2]].join(' '),
    author: quote.author
  }
}

server.get('/api', async (req, res) => {
  res.send(await getQuote())
})

server.use(
  morgan(':method :url :status :res[content-length] - :response-time ms')
)

process.env.NODE_ENV === 'production' && server.use(express.static('dist'))

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
