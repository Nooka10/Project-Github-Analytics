import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten } from '@material-ui/core/styles/colorManipulator';

let counter = 0;
function createData(avatar, pseudo, name, nb_followers, location, link) {
  counter += 1;
  return {
    id: counter, avatar, pseudo, name, nb_followers, location, link,
  };
}

function getMostFollowedUsers() {
  return fetch('http://localhost:3000/followers')
    .then(res => res.json())
    .then(res => res.map(item => createData(item.avatar, item.pseudo, item.name, item.nb_followers, item.location, item.link)));
}

function getMostStarredRepos() {
  return fetch('http://localhost:3000/stars')
    .then(res => res.json())
    .then(res => res.map(item => createData(item.repo_name, item.owner, item.language, item.nb_stars, item.description, item.link)));
}

function getMostForkedRepos() {
  return fetch('http://localhost:3000/forks')
    .then(res => res.json())
    .then(res => res.map(item => createData(item.repo_name, item.owner, item.language, item.nb_forks, item.description, item.link)));
}

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
  {
    id: 'avatar', numeric: false, disablePadding: true, activeSort: false, label: 'Avatar',
  },
  {
    id: 'pseudo', numeric: false, disablePadding: true, activeSort: true, label: 'Pseudo',
  },
  {
    id: 'name', numeric: false, disablePadding: true, activeSort: false, label: 'Name',
  },
  {
    id: 'nb_followers', numeric: false, disablePadding: true, activeSort: true, label: 'Followers',
  },
  {
    id: 'location', numeric: false, disablePadding: true, activeSort: true, label: 'Location',
  },
  {
    id: 'github_link', numeric: false, disablePadding: true, activeSort: false, label: 'Github Profil',
  },
];

class EnhancedTableHead extends React.Component {
  createSortHandler = property => (event) => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { order, orderBy } = this.props;

    return (
      <TableHead>
        <TableRow>
          {rows.map(row => (
            <TableCell
              key={row.id}
              numeric={row.numeric}
              padding={row.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === row.id ? order : false}
            >
              {
                row.activeSort ? (
                  <Tooltip
                    title="Sort"
                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={orderBy === row.id}
                      direction={order}
                      onClick={this.createSortHandler(row.id)}
                    >
                      {row.label}
                    </TableSortLabel>
                  </Tooltip>
                ) : (
                    <TableHead>
                      {row.label}
                    </TableHead>
                  )
              }
            </TableCell>
          ), this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper,

  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class EnhancedTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: 'desc',
      orderBy: 'nb_followers',
      data: [],
      page: 0,
      rowsPerPage: 10,
      value: 0,
    };
    getMostFollowedUsers().then((res) => {
      this.setState({ data: res });
    });
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };


  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const {
      data, order, orderBy, rowsPerPage, page,
    } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (

      <Paper className={classes.root}>

        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead

              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={n.id}
                  >
                    <TableCell component="th" scope="row" padding="none">
                      {<img
                        id="avatar_user"
                        alt="avatar_user"
                        src={n.avatar}
                        style={{
                          height: 50, width: 50, borderRadius: 2, overflow: 'hidden',
                        }}
                      />}
                    </TableCell>
                    <TableCell>{n.pseudo}</TableCell>
                    <TableCell>{n.name}</TableCell>
                    <TableCell>{n.nb_followers}</TableCell>
                    <TableCell>{n.location}</TableCell>
                    <TableCell>
                      <Button variant="outlined" href={n.link} target="_blank">
                        Go to the profil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedTable);
