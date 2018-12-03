const fs = require('fs')
const imdb = require('imdb-api')
const moment = require('moment')

const movies = require('./movies.json')
const apiKey = 'a8e03283'
const timeout = 30000

const ERR = 'ERR'
const GET = 'GET'
const MSG = 'MSG'

const omdbLog = fs.createWriteStream(__dirname + '/omdb.log', { flags: 'a' })
const timestamp = () => { return moment().toISOString() }

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
  const movie = movies[movieIdx]

  // TODO: enable forcing update (prob only for a single movie)
  if (!movie.lastImdbUpdate && !movie.imdbError) {
    moviesUpdated.push(movie.filename)

    if (!movie.filenameNoExt) {
      movie.filenameNoExt = movie.title
    }
    const title = movie.title.replace(/ \(\d{4}\)$/, '')

    // TODO: if imdbid present, use it instead of title
    // e.g., Adaptation (tt0268126) returns incorrect film for title
    // Airplane 2 (tt0083530)

    imdb.get({ name: title}, { apiKey, timeout })
      .then(res => {
        const updated = updateMovie(movie, res)
        movies[movieIdx] = updated
        log(GET, title, updated)
        console.log(JSON.stringify(updated, null, 2))

        ++movieIdx
        checkMovie()
      })
      .catch(err => {
        log(ERR, title, err)

        movies[movieIdx].imdbError = err.message || true
        movies[movieIdx].lastImdbUpdate = new Date()

        if (continueOnError) {
          ++movieIdx
          checkMovie()
        } else {
          finish()
        }
      })
    } else {
      log(MSG, movie.title, { MSG: 'already updated' })

      ++movieIdx
      checkMovie()
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
    const newFilename = __dirname + '/movies-' + moment().format('YYYYMMDDHHMMSS') + '.json'
    fs.renameSync(__dirname + '/movies.json', newFilename)

    const moviesJson = fs.createWriteStream(__dirname + '/movies.json')
    moviesJson.write(JSON.stringify(movies, null, 2))
    moviesJson.end()

    console.log('%d movies updated', moviesUpdated.length)
    console.log(moviesUpdated.join(', '))
  } else {
    console.log('no updates')
  }
}

function log(type, title, res) {
  const movieTitle = title || ''
  const movieResult = res ? JSON.stringify(res, null, 2) : ''

  const logstr = type + ' ' + timestamp() + ': imdb.get { "' + movieTitle + '" }\n'
  omdbLog.write(logstr)
  console.log(logstr)

  if (res) {
    omdbLog.write(movieResult + '\n')
    console.log(movieResult)
  }
}

function updateMovie(movie, update) {
  const updated = Object.assign({}, movie, update)

  updated.lastUpdate = updated.lastImdbUpdate = new Date()

  return updated
}


var movieIdx = 0
const moviesUpdated = []
// TODO: make continueOnError a command argument
const continueOnError = true
const LIMIT = 100

checkMovie()
