import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

export default class Group extends Component {
  constructor(props) {
    super(props)

    this.state = Object.assign({}, {
      showMovies: {},
    }, this.state)
  }

  componentDidMount() {
    console.log('componentDidMount, my good man')
    const showMovies = {}
    this.props.groups.forEach(group => {
      showMovies[group] = this.props.expandAll
    })
    this.setState({ showMovies })
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
      movies.push(
        <li key={idx}>{movie.title}</li>
      )
    })
    return movies
  }

  toggleGroup(groupName) {
    const showMovies = this.state.showMovies
    showMovies[groupName] = !showMovies[groupName]
    this.setState({ showMovies })
  }

  expandAllGroups(isExpanded) {
    const showMovies = this.state.showMovies
    this.props.groups.forEach(group => {
      showMovies[group] = isExpanded
    })
    this.setState({ showMovies })
  }
}
