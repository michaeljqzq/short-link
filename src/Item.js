import React, { Component } from 'react';
import './Item.scss';

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyw: undefined,
      type: undefined,
      data: undefined,
    }
  }

  componentDidMount() {
    this.setState({
      keyw: this.props.keyw,
      type: this.props.type,
      data: this.props.data,
    });
  }

  render() {
    return (
      <div className="module item">
        <a target="_blank" href={"/"+this.state.keyw} className="col-key">{this.state.keyw}</a>
        <span className="col-type">{this.state.type}</span>
        <span className="col-data">{this.state.data}</span>
        <span className="col-delete button" onClick={this.props.deleteItem.bind(null, this.state.keyw)}>Delete</span>
      </div>
    );
  }
}

export default Item;
