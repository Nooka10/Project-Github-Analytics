/* eslint-disable react/prop-types, react/jsx-handler-names */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import { Graph } from 'react-d3-graph';

function getUsers() {
  const users = [];

  fetch('https://api-projet-github.herokuapp.com/graph/allnodes')
    .then(res => res.json())
    .then(res => res.map(item => users.push({ label: item, value: item })));
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


const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100%',
    marginTop: '50px',
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
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

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

const counter = 1;

class IntegrationReactSelect extends React.Component {
  state = {
    user1: suggestions[0],
    user2: suggestions[1],
    searchActive: false,
    usersPath: [],
  };

  handleChange = name => (value) => {
    this.setState({
      [name]: value,
    });
  };

  handleSearch = () => {
    const pathTab = [];
    const a = [];
    const b = [];
    fetch(`https://api-projet-github.herokuapp.com/graph/dijkstra?usernamefrom=${this.state.user1.label}&usernameto=${this.state.user2.label}`)
      .then(res => res.json())
      .then(res => res.pathTo.map(i => a.push({ id: i })))
      .then(() => {
        for (let i = 0; i < a.length - 1; i++) {
          console.log(i);
          console.log(a[i]);

          b.push({ source: a[i].id, target: a[i + 1].id });
        }
      })
      .then(() => {
        this.setState({
          searchActive: true,
          usersPath: {
            nodes: a,
            links: b,
          },
        });
      });
  }

  render() {
    const { classes, theme } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <div className={classes.root}>
        <NoSsr>

          <Select
            classes={classes}
            styles={selectStyles}
            textFieldProps={{
              label: 'GitHub User 1',
              InputLabelProps: {
                shrink: true,
              },
            }}
            options={suggestions}
            components={components}
            value={this.state.user1}
            onChange={this.handleChange('user1')}
            placeholder="Search a first GitHub user"
          />
          <div className={classes.divider} />
          <Select
            classes={classes}
            styles={selectStyles}
            textFieldProps={{
              label: 'GitHub User 2',
              InputLabelProps: {
                shrink: true,
              },
            }}
            options={suggestions}
            components={components}
            value={this.state.user2}
            onChange={this.handleChange('user2')}
            placeholder="Search a second GitHub user"
          />
        </NoSsr>
        <Button variant="contained" size="large" color="default" className={classes.button} fullWidth onClick={this.handleSearch}>
          Search
          <SearchIcon className={classes.rightIcon} />
        </Button>

        {this.state.searchActive
          && (
          <Graph
            id="graph-id"
            data={this.state.usersPath}
            config={myConfig}
            ref="graph"
          />
          )

        }
      </div>
    );
  }
}

IntegrationReactSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(IntegrationReactSelect);
