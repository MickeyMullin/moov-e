import React, { Component } from 'react';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Moov-E</h1>
          <div>
            <button>Alpha</button>
            <button>Downloaded</button>
          </div>

          <button>Expand/Collapse All</button>
        </header>
        <main>
          <div className="alpha-view">
            <h2>Alpha</h2>
            <div className="dir">(movies)</div>
          </div>

          <div className="modified-view">
            <h2>Downloaded</h2>
            <div className="dir">(movies)</div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
