import React, {Component} from 'react';
import Dashboard from './Dashboard';
import Login from './Login';
import { Route, Switch, Redirect } from 'react-router-dom';
import constant from '../constant';

class App extends Component {
  checkAuth = () => {
    return !!localStorage.getItem('token');
  }

  render() {
    return <Switch>
      <Route path={`/${constant.reactLoginPath}`} component={Login} />
      <Route path='/' render={()=> this.checkAuth() ? <Dashboard /> : <Redirect to={`/${constant.reactLoginPath}`} />} />
    </Switch>
  }
}

export default App;