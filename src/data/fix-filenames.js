const fs = require('fs')
const walk = require('walk')

const moviedir = '/mnt/g/videos/movies'
const dirname = __dirname + '/movies/'

const walker  = walk.walk(moviedir, { followLinks: false })
const movies = []

// const ignored = [
//   'idx',
//   'jpg',
//   'srt',
//   'sub',
//   'txt'
// ]

console.log('current dir: %s', __dirname)

walker.on('file', (root, stat, next) => {
  const dir = root.replace(moviedir + '/', '')

  let extension = stat.name.match(/\.([^\.]+)$/)
  if (extension) {
    extension = extension[1].toLowerCase()
  } else {
    extension = ''
  }
  // if (ignored.includes(extension)) { next(); return }
  // extensions[extension] = true

  const filename = stat.name.replace(/\.[^\.]+$/, '')

  if (/\.\./.test(filename)) {
    console.log(filename)
  }

  // Friday 1 DC.720 - 1995
  // Friday 2 - Next Friday - 2000
  // --
  // Slapshot.720
  // Sleeping with Other People (2015) 720p
  // The Thing,720 - 2011
  // Colombiana Unr
  // Spy (2015) UNRATED

  const fheight = /[\., ]?(?:720|1080)p?$/
  const unstandard = /(?:[\.,](?:720|1080)p?)? - (\d{4})$/
  const unr = / unr(?:ated)?$/i
  const hd = / \(hd\)$/i

  let fixfile = ''

  if (fheight.test(filename)) {
    fixfile = filename.replace(fheight, '')

    movies.push({
      dir,
      filename: fixfile,
      badName: filename,
      fixName: fixfile,
      extension,
      reason: 'fhgt'
    })
  }

  if (unstandard.test(filename)) {
    fixfile = filename.replace(unstandard, ' ($1)')

    movies.push({
      dir,
      filename: fixfile,
      badName: filename,
      fixName: fixfile,
      extension,
      reason: 'unst'
    })
  }

  if (unr.test(filename)) {
    fixfile = filename.replace(unr, '')

    movies.push({
      dir,
      filename: fixfile,
      badName: filename,
      fixName: fixfile,
      extension,
      reason: 'UNR'
    })
  }

  if (hd.test(filename)) {
    fixfile = filename.replace(hd, '')

    movies.push({
      dir,
      filename: fixfile,
      badName: filename,
      fixName: fixfile,
      extension,
      reason: 'HD'
    })
  }

  if (fixfile === '') {
    movies.push({
      dir,
      filename: filename,
      badName: '',
      fixName: filename,
      extension,
      reason: 'good'
    })
  }
  
  fixfile = ''  
  next()
})

walker.on('end', function() {
  // sort by reason, then dir, then by name
  // TODO: title sort (ignore leading "a" and "the," etc.)
  movies.sort((a, b) => {
    return compare(a.reason, b.reason)
      || compare(a.dir, b.dir)
      || compare(a.filename, b.filename)
  })

  // const oneMovie = movies.filter(m => m.reason !== 'good')[0]
  // console.log(JSON.stringify(oneMovie))

  const problemMovies = fs.createWriteStream(dirname + 'problem-movies.log', { flags: 'a' })
  problemMovies.write(new Date().toISOString() + "\n")

  movies
  .filter(m => m.reason !== 'good')
  .forEach(m => {
    const badMoviePath = `${dirname}${m.dir}/${m.badName}.${m.extension}`
    const goodMoviePath = `${dirname}${m.dir}/${m.fixName}.${m.extension}`
    fs.access(goodMoviePath, fs.constants.F_OK, err => {
      if (err) {
        fs.renameSync(badMoviePath, goodMoviePath)
      } else {
        // add movie to "problem" collection
        problemMovies.write(`"new" exists: ${goodMoviePath}\n`)
      }
    })
    // console.log('%s: %s\t=>\t%s/%s.%s', m.reason, m.badName, m.dir, m.fixName, m.extension)
    // console.log(`${dirname}${m.dir}/${m.badName}.${m.extension}`)
  })

  // movies.forEach(m => console.log(m.badName + '\t=>\t' + m.fixName))

  const goodCount = movies.filter(m => m.reason === 'good').length
  const badCount = movies.filter(m => m.reason !== 'good').length
  fs.writeFileSync(dirname + 'movie-files.json', JSON.stringify(movies, null, 2))
  problemMovies.write(`processed ${movies.length} movies; `)
  problemMovies.write(`good: ${goodCount}; bad: ${badCount}\n`)
  console.log('done; processed %d movies', movies.length)
})

function compare(a, b) {
  a = a.toUpperCase()
  b = b.toUpperCase()
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
