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

  componentWillReceiveProps(props) {
    const { datas } = this.props;
    if (props.datas !== datas) {
      this.refs.graph.datas = props.datas;
      this.setState({
        dataStore: props.datas,
      });
    }
  }

  render() {
    let users = '';
    return (
     /* <Graph
        id="graph-id"
        data={this.state.dataStore}
        config={myConfig}
        ref="graph"
      />);
      */
      <div>

        {
          this.state.dataStore.map(user => users = users.concat(user).concat(' -> '))}
          users;
        }
      </div>
    )
  }
}
