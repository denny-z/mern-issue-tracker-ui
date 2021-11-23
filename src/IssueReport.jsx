import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';
import URLSearchParams from 'url-search-params';
import graphQLFetch from './graphQLFetch.js';
import IssueFilter from './IssueFilter.jsx';
import prepareIssueFilterVars from './prepareIssueFilterVars.js';
import store from './store.js';
import withToast from './withToast.jsx';

// IDEA: This can be extracted to a separate file to reuse in other places of application.
// E.g. select for IssueFilter component
const STATUSES = Object.freeze(['New', 'Assigned', 'Fixed', 'Closed']);

class IssueReport extends Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = prepareIssueFilterVars(params);
    const query = `query IssueReport(
      $status: StatusType
      $effortMin: Int
      $effortMax: Int
    ) {
      issueCounts(
        status: $status,
        effortMin: $effortMin
        effortMax: $effortMax
      ) {
        owner ${STATUSES.join(' ')}
      }
    }
    `;

    const data = await graphQLFetch(query, vars, showError);
    return data;
  }

  constructor(props) {
    super(props);
    const stats = store.initialData ? store.initialData.issueCounts : null;
    delete store.initialData;
    this.state = { stats };
  }

  componentDidMount() {
    const { stats } = this.state;
    if (stats == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.loadData();
    }
  }

  async loadData() {
    const { location: { search }, match, showError } = this.props;
    const data = await IssueReport.fetchData(match, search, showError);
    if (data) this.setState({ stats: data.issueCounts });
  }

  renderStatRows() {
    const { stats } = this.state;
    if (stats == null) return null;

    const result = stats.map((counts) => {
      const { owner, ...statusToCount } = counts;
      const sumOfCounts = Object
        .values(statusToCount)
        .reduce((previousValue, currentValue) => (previousValue + currentValue), 0);

      return (
        <tr key={counts.owner}>
          <td>{counts.owner}</td>
          {STATUSES.map(status => (
            <td key={status}>{counts[status]}</td>
          ))}
          <td>{sumOfCounts}</td>
        </tr>
      );
    });

    const sumRow = (
      <tr key="__sumOfColumn">
        <td><b><small>Total by status</small></b></td>
        {STATUSES.map(status => (
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
    const headerColumns = STATUSES.map(status => (
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

const IssueReportWithToast = withToast(IssueReport);
IssueReportWithToast.fetchData = IssueReport.fetchData;
export default IssueReportWithToast;
