import React from 'react';
import PropTypes from 'prop-types';
import deburr from 'lodash/deburr';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import { Graph } from 'react-d3-graph';
import Graphique from './Graph';

function getUsers() {
  const users = [];

  fetch('https://api-projet-github.herokuapp.com/graph/allnodes')
    .then(res => res.json())
    .then(res => res.map(item => users.push({ label: item })));
  return users;
}

const suggestions = getUsers();


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

const counter = 0;

function renderInputComponent(inputProps) {
  const {
    classes, inputRef = () => { }, ref, ...other
  } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: (node) => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input,
        },
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => (part.highlight ? (
          <span key={String(index)} style={{ fontWeight: 500 }}>
            {part.text}
          </span>
        ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          )))}
      </div>
    </MenuItem>
  );
}

function getSuggestions(value) {
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter((suggestion) => {
      const keep = count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

      if (keep) {
        count += 1;
      }

      return keep;
    });
}

function getSuggestionValue(suggestion) {
  return suggestion.label;
}

const styles = theme => ({
  root: {
    height: 250,
    flexGrow: 1,
    marginTop: 50,
  },
  container: {
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
  button: {
    margin: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
});

class IntegrationAutosuggest extends React.Component {
  state = {
    user1: 'wycats',
    user2: 'tsnow',
    suggestions: [],
    searchActive: false,
    redraw: false,
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value),
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  handleChange = name => (event, { newValue }) => {
    this.setState({
      [name]: newValue,
    });
  };

  handleSearch = () => {
    const a = [];
    const b = [];
    fetch(`https://api-projet-github.herokuapp.com/graph/dijkstra?usernamefrom=${this.state.user1}&usernameto=${this.state.user2}`)
      .then(res => res.json())
      .then((res) => {
        if (res.pathTo !== undefined) {
          res.pathTo.map(i => a.push({ id: i }));
        }
      })
      .then(() => {
        for (let i = 0; i < a.length - 1; i++) {
          b.push({ source: a[i].id, target: a[i + 1].id });
        }
      })
      .then(() => {
        this.setState({
          searchActive: true,
          redraw: !this.state.redraw,
          usersPath: {
            nodes: a,
            links: b,
          },
        });
      })
      .then(() => this.refs.graph.componentWillReceiveProps({
        data: {
          nodes: [{ id: 'lol' }],
          links: [],
        },
      }));
  }

  createGraph() {
    return (

      <Graph
        id="graph"
        data={this.state.usersPath}
        config={myConfig}
        ref="graph"
      />
    );
  }

  render() {
    const { classes } = this.props;

    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue,
      renderSuggestion,
    };

    return (
      <div className={classes.root}>
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            label: 'GitHub User 1',
            placeholder: 'Select a first GitHub user',
            value: this.state.user1,
            onChange: this.handleChange('user1'),
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderSuggestionsContainer={options => (
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )}
        />
        <div className={classes.divider} />
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            label: 'GitHub User 2',
            placeholder: 'Select a second GitHub user',
            value: this.state.user2,
            onChange: this.handleChange('user2'),
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderSuggestionsContainer={options => (
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )}
        />

        <Button variant="contained" size="large" color="default" className={classes.button} fullWidth onClick={this.handleSearch}>
          Search
          <SearchIcon className={classes.rightIcon} />
        </Button>

        {this.state.searchActive
          && (this.state.redraw
            ? (
              <Graphique datas={this.state.usersPath} />
            ) : (
              <Graphique datas={this.state.usersPath}/>
            ))
        }
      </div>
    );
  }
}

IntegrationAutosuggest.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IntegrationAutosuggest);
