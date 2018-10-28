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
import baseUrl from './config';


let counter = 0;
function createData(repo_name, owner, language, interestNumber, description, link) {
  counter += 1;
  return {
    id: counter, repo_name, owner, language, interestNumber, description, link,
  };
}

function getMostStarredRepos() {
  return fetch(`${baseUrl}/others/stars`)
    .then(res => res.json())
    .then(res => res.map(item => createData(item.repo_name, item.owner, item.language, item.nb_stars, item.description, item.link)))
    .catch(err => console.log(err));
}

function getMostForkedRepos() {
  return fetch(`${baseUrl}/others/forks`)
    .then(res => res.json())
    .then(res => res.map(item => createData(item.repo_name, item.owner, item.language, item.nb_forks, item.description, item.link)))
    .catch(err => console.log(err));
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
    id: 'repo_name', numeric: false, disablePadding: true, activeSort: true, label: 'Repo',
  },
  {
    id: 'owner', numeric: false, disablePadding: true, activeSort: true, label: 'Owner',
  },
  {
    id: 'language', numeric: false, disablePadding: true, activeSort: true, label: 'Language',
  },
  {
    id: 'interestNumber', numeric: false, disablePadding: true, activeSort: true, label: '',
  },
  {
    id: 'description', numeric: false, disablePadding: true, activeSort: true, label: 'Description',
  },
  {
    id: 'link', numeric: false, disablePadding: true, activeSort: false, label: 'Github Link',
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
                  <TableSortLabel>
                    {row.label}
                  </TableSortLabel>
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
};

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
      orderBy: 'interestNumber',
      data: [],
      page: 0,
      rowsPerPage: 10,
    };
    if (this.props.value === 1) {
      rows[3].label = 'Stars';
      getMostStarredRepos().then((res) => {
        this.setState({ data: res });
      });
    } else {
      rows[3].label = 'Forks';
      getMostForkedRepos().then((res) => {
        this.setState({ data: res });
      });
    }
  }


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
                      {n.repo_name}
                    </TableCell>
                    <TableCell>{n.owner}</TableCell>
                    <TableCell>{n.language}</TableCell>
                    <TableCell>{n.interestNumber}</TableCell>
                    <TableCell style={{ whiteSpace: 'normal', maxWidth: 200 }}>{n.description}</TableCell>
                    <TableCell>
                      <Button variant="outlined" href={n.link} target="_blank">
                        Go to the repo
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
