import React, { Component } from 'react';
// import './App.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSideBar: true
    }
  }

  render() {
    return (
      <div>Hello Short Link</div>
    );
  }
}

export default App;
