import React, { Component } from 'react';
import './App.css';
import Table from "./Table"

const baseUrl =  window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://heig-vd-ga-server.herokuapp.com';

const defaultSearch = 'octocat';

function getUser(username) {
  return fetch(`https://api.github.com/search/users?q=followers:>=1000`)
    .then(res => res.json());
}

function getLanguages(username) {
  return fetch(`${baseUrl}/languages/${username}`)
    .then(res => res.json());
}




class App extends Component {
  render() {
    return (
      <div>
        <Table/>
      </div>
    );
  }
}

export default App;

