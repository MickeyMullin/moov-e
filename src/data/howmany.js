const movies = require('./movies.json')

const processed = movies.filter(m => m.lastImdbUpdate)
const errors = processed.filter(p => p.imdbError)
const remaining = movies.filter(m => !m.lastImdbUpdate)

console.log('total movies: %d', movies.length)
console.log('processed: %d', processed.length)
console.log('errors: %d', errors.length)
console.log('need initial process: %d', remaining.length)
