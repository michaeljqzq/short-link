import React, { Component } from 'react';
import './App.scss';
import queryString from 'query-string';
import Item from './Item';
import constant from '../constant';
import { Notification } from 'react-notification';
import ReactPaginate from 'react-paginate';
import Dropzone from 'react-dropzone';

const DEFAULT_TYPE = '-- All --';

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
      filterType: DEFAULT_TYPE,
      filterSearch: '',
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
            numOfPages: Math.ceil(data.total / constant.itemsPerPage),
          });
        }
      });
  }

  fetchItemsFromServer = (page, type, search) => {
    let condition = {};
    if (page) condition.page = page;
    if (type && type !== DEFAULT_TYPE) condition.type = type;
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

  onFilterSearchChange = (event) => {
    this.setState({
      filterSearch: event.target.value
    });
  }

  onSearchEnterPressed = (event) => {
    if (event.charCode === 13) {
      this.fetchItemsFromServer(0, this.state.filterType, this.state.filterSearch)
        .then(results => results.json())
        .then((data) => {
          if (!data.success) {
            console.error('fetch data error, ' + data.error);
          } else {
            this.setState({
              items: data.data,
              numOfPages: Math.ceil(data.total / constant.itemsPerPage),
            });
          }
        });
    }
  }

  onFilterTypeChange = (event) => {
    this.setState({
      filterType: event.target.value
    }, () => {
      this.fetchItemsFromServer(0, this.state.filterType, this.state.filterSearch)
        .then(results => results.json())
        .then((data) => {
          if (!data.success) {
            console.error('fetch data error, ' + data.error);
          } else {
            this.setState({
              items: data.data,
              numOfPages: Math.ceil(data.total / constant.itemsPerPage),
            });
          }
        });
    });
  }

  onSubmit = () => {
    let headers = new Headers();
    let body;
    if (this.state.type === 'link') {
      headers.append('Content-Type', 'application/json');
      body = JSON.stringify({
        keyw: this.state.keyw,
        type: this.state.type,
        data: this.state.data
      });
    } else if (this.state.type === 'file') {
      // headers.append('Content-Type', 'multipart/form-data');
      let form = new FormData();
      form.append('file', this.state.data);
      form.append('type', this.state.type);
      body = form;
    }

    fetch('/api/' + encodeURIComponent(this.state.keyw), {
      method: 'POST',
      body,
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
    this.fetchItemsFromServer(targetPage, this.state.filterType, this.state.filterSearch)
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

  deleteItem = (keyw) => {
    fetch('/api/' + encodeURIComponent(keyw), {
      method: 'DELETE',
    }).then(results => results.json()).then((data) => {
      if (data.success) {
        this.showNotification('Delete success', 3000);
      } else {
        console.error(data.error);
      }
    });
  }

  onDrop = (files) => {
    this.setState({
      data: files[0]
    });
  }

  render() {
    let dataInput;
    if (this.state.type === 'link') {
      dataInput = <input className="new-url" placeholder="url" value={this.state.data} onChange={this.onDataChange} />;
    } else if (this.state.type === 'file') {
      dataInput = <Dropzone className="new-file" onDrop={this.onDrop}
        multiple={false} >
        <p>{this.state.data ? this.state.data.name : 'Drag & Drop.'}</p>
      </Dropzone>
    }
    let filterTypes = constant.types.slice();
    filterTypes.unshift(DEFAULT_TYPE);
    return (
      <div className="main">
        <div className="title">MJ's short link</div>
        <h3>Add/Update</h3>
        <div className="new-item module">
          <input className="new-key" placeholder="Keyword" value={this.state.keyw} onChange={this.onKeyChange} />
          <select className="new-type" value={this.state.type} onChange={this.onTypeChange}>
            {
              constant.types.map(t => <option key={t} value={t}>{t}</option>)
            }
          </select>

          {dataInput}
          <button className="new-submit button" onClick={this.onSubmit}>Submit</button>
        </div>

        <h3>Query Filter</h3>

        <div className="filter module">
          <select className="filter-type" value={this.state.filterType} onChange={this.onFilterTypeChange}>
            {
              filterTypes.map(t => <option key={t} value={t}>{t}</option>)
            }
          </select>
          <input className="filter-search" placeholder="search" value={this.state.filterSearch} onChange={this.onFilterSearchChange} onKeyPress={this.onSearchEnterPressed} />
        </div>

        <div className="result">
          <div className="item module llabel">
            <span className="col-key">Keyword</span>
            <span className="col-type">Type</span>
            <span className="col-data">Data</span>
            <span className="col-delete">Operation</span>
          </div>
          {this.state.items.map(item => <Item key={item.keyw} deleteItem={this.deleteItem} {...item} />)}
        </div>


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
