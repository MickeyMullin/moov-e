// TODO: mark movies in movies.json that aren't in movie-files.json
// TODO: change callbacks to promises: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
// TODO: add "correctedTitle" property with editor; look for it in subsequent scanning
const fs = require('fs')
const path = require('path')
const imdb = require('imdb-api')
const moment = require('moment')

const config = require('./config.js')
const dataPath = '../src/data/'
const movieFilesPath = path.join(__dirname, dataPath, 'movie-files.json')
const moviesJsonPath = path.join(__dirname, dataPath, 'movies.json')

const ERR = 'ERR'
const GET = 'GET'
const MSG = 'MSG'
const timeout = 30000

var movieIdx = 0
const moviesUpdated = []
// TODO: make continueOnError a command argument
const continueOnError = true
const LIMIT = 61

const movies = require(movieFilesPath)
const moviesFull = require(moviesJsonPath)
const omdbLog = fs.createWriteStream(__dirname + '/omdb.log', { flags: 'a' })

console.log('movies: ', movies.length)
console.log('moviesFull: ', moviesFull.length)

function archiveFile(filename, callback) {
  const originalPath = path.join(__dirname, dataPath, filename)
  const archiveName = filename.replace(/(\..+)$/, '-' + moment().format('YYYYMMDDHHMMSS') + '$1')
  const archivePath = path.join(__dirname, dataPath, 'archive', archiveName)
  fs.rename(originalPath, archivePath, err => {
    if (err) {
      log(ERR, 'failed to archive ' + filename, err)
      return
    }
    callback()
  })
}

function checkMovie() {
  if (movieIdx < movies.length && moviesUpdated.length < LIMIT) {
    getMovie()
    return
  }

  finish()
}

function compare(a, b) {
  const titleRe = /^(The |A |An )/i
  a = a.replace(titleRe, '').toUpperCase()
  b = b.replace(titleRe, '').toUpperCase()
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function getMovie() {
  var movie
  const movieFile = movies[movieIdx]
  var moviesFullIdx = moviesFull.findIndex(mf => mf.filename === movieFile.filename)
  if (moviesFullIdx > -1) {
    movie = moviesFull[moviesFullIdx]
  } else {
    movie = movieFile
    moviesFullIdx = moviesFull.push(movie) - 1
  }

  // TODO: enable forcing update (prob only for a single movie)
  // TODO: if imdbid present, use it instead of title
  // e.g., Adaptation (tt0268126) returns incorrect film for title
  // Airplane 2 (tt0083530)
  if (movie.lastImdbUpdate || movie.imdbError) {
    // log(MSG, movie.title, { MSG: 'already updated' }, 0)

    ++movieIdx
    checkMovie()
  } else {
    moviesUpdated.push(movie.filename)

    if (!movie.filenameNoExt) {
      movie.filenameNoExt = movie.title
    }

    const mre = /(.+?)(?: \((\d{4})\))?$/
    const movieMatch = movie.title.match(mre)
    const title = movieMatch[1]
    const year = movieMatch[2]
    const imdbConfig = {
      name: title,
      year
    }
    var yearLog = year ? ' (' + year + ')' : ''
    const logTitle = imdbConfig.name + yearLog

    imdb.get(imdbConfig, { apiKey: config.apiKey, timeout })
      .then(res => {
        const updated = updateMovie(movie, res)
        moviesFull[moviesFullIdx] = updated
        log(GET, logTitle, updated)

        ++movieIdx
        checkMovie()
      })
      .catch(err => {
        if (err.message) {
          log(ERR, title, { message: err.message }, 0)
        } else {
          log(ERR, title, err)
        }

        moviesFull[moviesFullIdx].imdbError = err.message || true
        moviesFull[moviesFullIdx].lastImdbUpdate = new Date()

        if (continueOnError) {
          ++movieIdx
          checkMovie()
        } else {
          finish()
        }
      })
    }
}

function finish() {
  // sort by dir then by name
  movies.sort((a, b) => {
    var comp = compare(a.dir, b.dir)
    if (!comp) return compare(a.filename, b.filename)
    return comp
  })

  if (moviesUpdated.length) {
    archiveFile('movies.json', writeFinal)
  } else {
    console.log('no updates')
  }
}

function log(type, title, res, space) {
  if (typeof space === 'undefined') {
    space = 2
  }
  const movieTitle = title || ''
  const movieResult = res ? JSON.stringify(res, null, space) : ''

  const logstr = type + ' ' + moment().toISOString() + ': imdb.get { "' + movieTitle + '" }\n'
    omdbLog.write(logstr)
    console.log(logstr)

  if (res) {
    omdbLog.write(movieResult + '\n')
    console.log(movieResult)
  }
}

function updateMovie(movie, update) {
  const updated = Object.assign({}, movie, update, { lastImdbUpdate: new Date() })
  return updated
}

function writeFinal() {
  const moviesJson = fs.createWriteStream(moviesJsonPath)
  moviesJson.write(JSON.stringify(moviesFull, null, 2), 'utf8', () => {
    console.log('%d movies updated', moviesUpdated.length)
    console.log(moviesUpdated.join(', '))
    })
}

checkMovie()
