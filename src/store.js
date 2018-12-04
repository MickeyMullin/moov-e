import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import moment from 'moment'
import reducer from './reducer'
import movies from './data/movies.json'

const initialState = {
  movies,
  added: getAddedMonths(),
  directories: getDirectories(),
  releases: getReleases(),
  expandAll: false,
}

function getAddedMonths() {
  const months = {}
  movies.forEach(movie => {
    const yearMonth = moment(movie.modified).format('YYYY-MM')
    if (!(yearMonth in months)) { months[yearMonth] = [] }
    months[yearMonth].push(movie)
  })
  return months
}

function getDirectories() {
  const dirs = {}
  movies.forEach(movie => {
    if (!(movie.dir in dirs)) { dirs[movie.dir] = [] }
    dirs[movie.dir].push(movie)
  })
  return dirs
}

function getReleases() {
  const releases = {}
  movies.forEach(movie => {
    if (!movie.year) { movie.year = 'unknown' }
    if (!(movie.year in releases)) { releases[movie.year] = [] }
    releases[movie.year].push(movie)
  })
  return releases
}

export default function configureStore() {
  return createStore(
    reducer,
    initialState,
    applyMiddleware(thunk)
  )
}
