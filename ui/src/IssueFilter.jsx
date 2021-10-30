import React from 'react';
import { withRouter } from 'react-router-dom';
import URLSearchParams from 'url-search-params';

// eslint-disable-next-line react/prefer-stateless-function
class IssueFilter extends React.Component {
  constructor({ location: { search } }) {
    super();
    const params = new URLSearchParams(search);
    this.state = {
      status: (params.get('status') || ''),
      isChanged: false,
    };

    this.onStatusChange = this.onStatusChange.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.showOriginalFilter = this.showOriginalFilter.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.showOriginalFilter();
    }
  }

  onStatusChange(e) {
    this.setState({ status: e.target.value, isChanged: true });
  }

  showOriginalFilter() {
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    this.setState({
      status: params.get('status') || '',
      isChanged: false,
    });
  }

  applyFilter() {
    const { status } = this.state;
    const { history } = this.props;

    history.push({
      path: '/issues',
      search: status ? `?status=${status}` : '',
    });
  }

  render() {
    const { status, isChanged } = this.state;

    return (
      <div>
        Status
        {' '}
        <select value={status} onChange={this.onStatusChange}>
          <option value="">All</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="Closed">Closed</option>
        </select>
        {' | '}
        <button type="button" onClick={this.applyFilter}>Apply</button>
        {' | '}
        <button type="button" onClick={this.showOriginalFilter} disabled={!isChanged}>Reset</button>
      </div>
    );
  }
}

export default withRouter(IssueFilter);
