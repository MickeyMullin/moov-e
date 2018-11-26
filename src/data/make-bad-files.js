const fs = require('fs')
const walk = require('walk')

const moviedir = '/mnt/g/videos/movies'
const dirname = __dirname + '/movies/'

const walker  = walk.walk(moviedir, { followLinks: false })
const movies = []

const ignored = [
  'idx',
  'jpg',
  'srt',
  'sub',
  'txt'
]

console.log('current dir: %s', __dirname)

let priordir = ''

walker.on('file', (root, stat, next) => {
  const dir = root.replace(moviedir + '/', '')

  // ensure directory exists
  if (dir !== moviedir && dir !== priordir) {
    fs.access(dirname + dir, fs.constants.F_OK, err => {
      if (err) {
        fs.mkdir(dirname + dir, err => {
          if (err) {
            throw err
          } else
            console.log(`created ${dirname}${dir}`)
        })
        
      }
    })
    priordir = dir
  }

  let extension = stat.name.match(/\.([^\.]+)$/)
  if (extension) {
    extension = extension[1].toLowerCase()
  } else {
    extension = ''
  }
  // if (ignored.includes(extension)) { next(); return }

  const filename = stat.name.replace(/\.[^\.]+$/, '')

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

  // filenames that need no help
  // console.log('good:')
  // movies
  //   .filter(m => m.reason === 'good')
  //   .forEach(m => console.log('%s', m.filename))

  movies
    .filter(m => m.reason !== 'good')
    .forEach(m => {
      const moviepath = `${dirname}${m.dir}/${m.badName}.${m.extension}`
      // console.log('%s: %s\t=>\t%s/%s.%s', m.reason, m.badName, m.dir, m.fixName, m.extension)
      // console.log(`${dirname}${m.dir}/${m.badName}.${m.extension}`)
      console.log('creating: %s', moviepath)
      fs.closeSync(fs.openSync(moviepath, 'w'));
    })
 
  // const oneMovie = movies.filter(m => m.reason !== 'good')[0]
  // console.log(JSON.stringify(oneMovie))

  console.log('done; processed %d movies', movies.length)
})

function compare(a, b) {
  a = a.toUpperCase()
  b = b.toUpperCase()
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
