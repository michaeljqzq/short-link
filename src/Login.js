import React, {Component} from 'react';
import constant from '../constant';
import { withRouter } from 'react-router-dom';
import './Login.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    }
  }

  onChange = (item, event) => {
    this.setState({
      [item]: event.target.value
    });
  }

  onEnterPressed = (event) => {
    if (event.charCode === 13) {
      fetch(`/${constant.loginPath}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        }),
      }).then(response => {
        if (response.status === 401 || response.status === 200) {
          return response.json();
        }
      }).then(result => {
        if (result.type === 'error') {
          alert(result.message);
        } else {
          localStorage.setItem('token', result.token);
          this.props.history.push('/');
        }
      });
    }
  }

  render() {
    return <div className="login">
      <input value={this.state.username} placeholder="User Name" type="username" name="username" onChange={this.onChange.bind(null, 'username')} onKeyPress={this.onEnterPressed} />
      <input value={this.state.password} placeholder="Password"type="password" name="password" onChange={this.onChange.bind(null, 'password')} onKeyPress={this.onEnterPressed} />
    </div>
  }
}

export default withRouter(({ history }) => <App history={history} />);