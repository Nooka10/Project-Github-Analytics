import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TableUsers from './TableUsers';
import TableRepos from './TableRepos';

class App extends Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    return (
      <div>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange} centered>
            <Tab label="Most following users" />
            <Tab label="Most starred repos" />
            <Tab label="Most forked repos" />
          </Tabs>
        </AppBar>
        {value === 0 && <TableUsers />}
        {value === 1 && <TableRepos value={value} />}
        {value === 2 && <TableRepos value={value} />}
      </div>
    );
  }
}

export default App;
