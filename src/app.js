import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Tab, Tabs } from '@material-ui/core'
// import { withStyles } from '@material-ui/core/styles'
import Header from './header'
import Group from './group'
import './app.scss'

const ALPHA = 0
const RELEASE = 1
const ADDED = 2

const mapStateToProps = (state = {}) => {
  return {
    releases: state.releases || [],
    directories: state.directories || [],
    added: state.added || [],
    movies: state.movies || []
  }
}

// const styles = theme => ({
//   backgroundColor: '#2196f3',
// })

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      view: ALPHA,
      expandAll: false,
      addedSort: this.sortedKeys(this.props.added).reverse(),
      dirSort: this.sortedKeys(this.props.directories),
      releaseSort: this.sortedKeys(this.props.releases).reverse()
    }
  }

  isView(view) {
    return this.state.view === view
  }

  changeView(e, view) {
    this.setState({ view })
  }

  sortedKeys(arr) {
    return Object.keys(arr).sort()
  }

  toggleExpand() {
    this.setState({ expandAll: !this.state.expandAll })
  }

  render() {
    return (
      <div className="app">
        <Header />
        <div class="header">
          <Tabs
            value={this.state.view}
            onChange={this.changeView.bind(this)}
          >
            <Tab label="Alpha" />
            <Tab label="Release" />
            <Tab label="Added" />
          </Tabs>

          <Button
            variant="outlined"
            color="secondary"
            onClick={this.toggleExpand.bind(this)}
          >
            {this.state.expandAll ? 'Collapse' : 'Expand'} All
          </Button>
        </div>

        <main>
          {this.isView(ALPHA) &&
            <div className="alphaView">
              <h3>Alpha Order</h3>
              <Group
                groups={this.state.dirSort}
                movies={this.props.directories}
                expandAll={this.state.expandAll}
              />
            </div>
          }
          {this.isView(RELEASE) &&
            <div className="releaseView">
              <h3>Release Order</h3>
              <Group
                groups={this.state.releaseSort}
                movies={this.props.releases}
                expandAll={this.state.expandAll}
              />
            </div>
          }
          {this.isView(ADDED) &&
            <div className="addedView">
              <h3>Added</h3>
              <Group
                groups={this.state.addedSort}
                movies={this.props.added}
                expandAll={this.state.expandAll}
              />
            </div>
          }
        </main>
      </div>
    )
  }
}

export default connect(mapStateToProps)(
  // withStyles(styles(
    App
  // ))
)
