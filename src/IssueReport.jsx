import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import IssueFilter from './IssueFilter.jsx';
import { ISSUE_STATUS_LIST } from './constants.js';
import { loadStats as loadStatsAction, clearStats as clearStatsAction } from './redux/actions.js';

class IssueReport extends Component {
  static async fetchData(match, search) {
    return loadStatsAction(search);
  }

  componentDidMount() {
    const { isLoaded } = this.props;
    if (!isLoaded) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.loadData();
    }
  }

  componentWillUnmount() {
    const { clearStats } = this.props;
    clearStats();
  }

  async loadData() {
    const {
      location: { search }, loadStats,
    } = this.props;

    loadStats(search);
  }

  renderStatRows() {
    const { stats, isLoaded } = this.props;
    if (!isLoaded) return null;

    const result = stats.map((counts) => {
      const { owner, ...statusToCount } = counts;
      const sumOfCounts = Object
        .values(statusToCount)
        .reduce((previousValue, currentValue) => (previousValue + currentValue), 0);

      return (
        <tr key={counts.owner}>
          <td>{counts.owner}</td>
          {ISSUE_STATUS_LIST.map(status => (
            <td key={status}>{counts[status]}</td>
          ))}
          <td>{sumOfCounts}</td>
        </tr>
      );
    });

    const sumRow = (
      <tr key="__sumOfColumn">
        <td><b><small>Total by status</small></b></td>
        {ISSUE_STATUS_LIST.map(status => (
          <td key={`__sumOfColumn_${status}`}>
            {stats.reduce((previousValue, counts) => (previousValue + counts[status]), 0)}
          </td>
        ))}
        <td>{' '}</td>
      </tr>
    );
    result.push(sumRow);

    return result;
  }

  render() {
    const headerColumns = ISSUE_STATUS_LIST.map(status => (
      <th key={status}>{status}</th>
    ));
    headerColumns.push(<th key="__sumOfRow"><small>Total by owner</small></th>);
    const statRows = this.renderStatRows();

    return (
      <>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter urlBase="/report" />
          </Panel.Body>
        </Panel>
        <Table bordered condensed hover responsive>
          <thead>
            <tr>
              <th>{' '}</th>
              {headerColumns}
            </tr>
          </thead>
          <tbody>
            {statRows}
          </tbody>
        </Table>
      </>
    );
  }
}

const mapStateToProps = state => ({
  stats: state.issueCounts.stats,
  isLoaded: state.issueCounts.isLoaded,
});

const mapDispatchToProps = dispatch => ({
  loadStats: search => dispatch(loadStatsAction((search))),
  clearStats: () => dispatch(clearStatsAction()),
});

const Connected = connect(mapStateToProps, mapDispatchToProps)(IssueReport);
Connected.fetchData = IssueReport.fetchData;
export default Connected;
