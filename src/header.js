import React, { Component } from 'react'
import './header.scss'

export default class Header extends Component {
  render() {
    return (
      <header>
        <h1 className="title">moov-E</h1>
        {/* <div>
          <span>View:</span>
          <button
            onClick={() => this.changeView('alpha')}
          >Alpha</button>
          <button
            onClick={() => this.changeView('added')}
          >Added</button>
        </div> */}

        {/* <button onClick={this.toggleExpand.bind(this)}>
          {this.state.expandAll ? 'Collapse' : 'Expand'} All
        </button> */}
      </header>
    )
  }
}
