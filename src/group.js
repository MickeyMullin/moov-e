import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

export default class Group extends Component {
  constructor(props) {
    super(props)

    this.state = Object.assign({}, {
      showMovies: {},
      movieCards: {},
    }, this.state)
  }

  componentDidMount() {
    console.log('componentDidMount, my good man')
    const showMovies = {}
    const movieCards = {}
    this.props.groups.forEach(group => {
      showMovies[group] = this.props.expandAll
      movieCards[group] = false
    })
    this.setState({ showMovies, movieCards })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.expandAll !== this.props.expandAll) {
      this.expandAllGroups(this.props.expandAll)
    }
  }

  render() {
    if (this.props.groups) {
      return (
        <div className="groups">
          {this.renderGroups()}
        </div>
      )
    }
  }

  renderGroups() {
    const groups = []
    this.props.groups.forEach((group, idx) => {
      groups.push(
        <div className="groupName" key={idx}>
          <Button
            id={group}
            variant="contained"
            onClick={() => this.toggleGroup(group)}
          >{group}</Button>
          <Button
            id={group + 'toggle'}
            variant="contained"
            onClick={() => this.toggleType(group)}
            className={this.state.showMovies[group] ? '' : 'hidden'}
          >{group} Cards</Button>
          <div className={this.state.showMovies[group] ? '' : 'hidden'}>
            <ol>
              {this.renderMovies(group)}
            </ol>
            <a href="#top">^</a>
          </div>
        </div>
      )
    })
    return groups
  }

  renderMovies(group) {
    const movies = []
    // TODO: title-sort
    this.props.movies[group].forEach((movie, idx) => {
      if (!this.state.movieCards[group]) {
        movies.push(
          <li key={idx}>{movie.title}</li>
        )
      } else {
        if (movie.imdbError) {
          movies.push(<li key={idx}>{movie.title} <em>(info error: {movie.imdbError})</em></li>)
        } else if (movie.lastImdbUpdate) {
          let rtRate = 'N/A'
          if (movie.ratings && movie.ratings.filter) {
            const rt = movie.ratings.filter(r => r.Source === 'Rotten Tomatoes')
            if (rt.length && rt[0].Value) {
              rtRate = rt[0].Value
            }
          }
          movies.push(
            <div key={idx} className="card">
              <h3>{movie.title} ({movie.year}) [{movie.rated}]</h3>
                <img className="poster" src={movie.poster} alt={movie.title} height="200" align="right" />
                <div>
                  <strong>Starring: </strong>
                  <span>{movie.actors}</span>
                </div>
                <div>
                  <strong>Genres: </strong>
                  <span>{movie.genres}</span>
                </div>
                <div className="rating">
                  <span><img className="icon-rating" src="icon-imdb.png" alt="IMDB" /> {movie.rating}</span>

                  &nbsp;

                  <span><img className="icon-rating" src="icon-rottentomatoes.png" alt="Rotten Tomatoes" /> {rtRate}</span>

                  &nbsp;

                  <span><img className="icon-rating" src="icon-metacritic.png" alt="Metacritic" />  {movie.metascore}</span>
                </div>
              </div>
          )
        } else {
          movies.push(<li key={idx}>{movie.title} <em>[...]</em></li>)
        }
      }
    })
    return movies
  }

  toggleGroup(groupName) {
    const showMovies = this.state.showMovies
    showMovies[groupName] = !showMovies[groupName]
    this.setState({ showMovies })
  }

  toggleType(groupName) {
    const movieCards = this.state.movieCards
    movieCards[groupName] = !movieCards[groupName]
    this.setState({ movieCards })
  }

  expandAllGroups(isExpanded) {
    const showMovies = this.state.showMovies
    this.props.groups.forEach(group => {
      showMovies[group] = isExpanded
    })
    this.setState({ showMovies })
  }
}
