const fs = require('fs')
const moment = require('moment')
const path = require('path')
const dataPath = '../src/data/'

const moviesFile = path.join(__dirname, dataPath, 'movies.json')
const movies = require(moviesFile)
const logFile = path.join(__dirname, dataPath + 'tmp.json')
const logs = require(logFile)

console.log('moviesFile: %s', moviesFile)
console.log('logFile: %s', logFile)

logs.forEach(log => {
  const movieIdx = movies.findIndex(m => m.filename === log.filename)
  const movie = movies[movieIdx]
  const update = Object.assign({}, movie, log)
  movies[movieIdx] = update
})

const newFilename = path.join(__dirname, dataPath, 'movies-' + moment().format('YYYYHHMMSS') + '.json')
console.log('newFilename: ' + newFilename)

fs.rename(moviesFile, newFilename, err => {
  if (err) {
    console.log('ERROR RENAMING FILE: ', err)
  }
  const movieWriter = fs.createWriteStream(moviesFile)
  movieWriter.write(JSON.stringify(movies, null, 2))
  console.log('done')
})
