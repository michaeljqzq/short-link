import React, { Component } from 'react';
import './App.scss';
import queryString from 'query-string';
import Item from './Item';
import constant from '../constant';
import { Notification } from 'react-notification';
import ReactPaginate from 'react-paginate';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      keyw: '',
      type: constant.types[0],
      data: '',
      notificationActive: false,
      notificationMessage: '',
      numOfPages: 0,
    }
  }

  componentDidMount() {
    this.fetchItemsFromServer()
      .then(results => results.json())
      .then((data) => {
        if (!data.success) {
          console.error('fetch data error, ' + data.error);
        } else {
          this.setState({
            items: data.data,
            numOfPages: (data.total - 1) / constant.itemsPerPage + 1,
          });
        }
      });
  }

  fetchItemsFromServer = (page, type, search) => {
    let condition = {};
    if (page) condition.page = page;
    if (type) condition.type = type;
    if (search) condition.search = search;
    return fetch('/api?' + queryString.stringify(condition));
  }

  onKeyChange = (event) => {
    this.setState({
      keyw: event.target.value
    });
  }

  onTypeChange = (event) => {
    this.setState({
      type: event.target.value
    });
  }

  onDataChange = (event) => {
    this.setState({
      data: event.target.value
    });
  }

  onSubmit = () => {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    fetch('/api/' + encodeURIComponent(this.state.keyw), {
      method: 'POST',
      body: JSON.stringify({
        keyw: this.state.keyw,
        type: this.state.type,
        data: this.state.data
      }),
      headers: headers,
    }).then(results => results.json()).then((data) => {
      if (data.success) {
        this.setState({
          keyw: '',
          data: '',
          type: constant.types[0],
        });
        this.showNotification('Update success', 3000);
      } else {
        console.error(data.error);
      }
    });
  }

  showNotification(message, timeout) {
    this.setState({
      notificationActive: true,
      notificationMessage: message
    });
    setTimeout(() => {
      this.setState({
        notificationActive: false,
        notificationMessage: ''
      });
    }, timeout);
  }

  handlePageClick = (data) => {
    let targetPage = data.selected;
    this.fetchItemsFromServer(targetPage, this.state.type, this.state.search)
      .then(results => results.json())
      .then((data) => {
        if (!data.success) {
          console.error('fetch data error, ' + data.error);
        } else {
          this.setState({
            items: data.data,
          });
        }
      });
  }

  render() {
    let dataInput;
    if (this.state.type === 'link') {
      dataInput = <input placeholder="url" value={this.state.data} onChange={this.onDataChange} />;
    }
    return (
      <div className="main">
        <div className="title">Management</div>
        <div className="new-item">
          <input placeholder="keyw" value={this.state.keyw} onChange={this.onKeyChange} />
          <select value={this.state.type} onChange={this.onTypeChange}>
            {
              constant.types.map(t => <option key={t} value={t}>{t}</option>)
            }
          </select>
          {dataInput}
          <button className="submit" onClick={this.onSubmit}>Submit</button>
        </div>

        {this.state.items.map(item => <Item key={item.keyw} {...item} />)}
        <ReactPaginate
          breakLabel={<a href="">...</a>}
          breakClassName={"break-me"}
          pageCount={this.state.numOfPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageClick}
          containerClassName={"pagination"}
        />
        <Notification
          isActive={this.state.notificationActive}
          message={this.state.notificationMessage}
        />
      </div>
    );
  }
}

export default App;
