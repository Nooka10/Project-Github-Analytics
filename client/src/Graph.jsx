import React from 'react';
import { Graph } from 'react-d3-graph';

const myConfig = {
  nodeHighlightBehavior: true,
  node: {
    color: 'lightgreen',
    size: 400,
    highlightStrokeColor: 'blue',
  },
  link: {
    highlightColor: 'lightblue',
  },
};

export default class Graphique extends React.Component {
  state = {
    dataStore: [],
  }

  constructor(props) {
    super(props);
    this.setState({
      dataStore: props.datas,
    });
  }

  render() {
    return (
      <Graph
        id="graph-id"
        data={this.props.datas}
        config={myConfig}
        ref="graph"
      />);
  }
}
