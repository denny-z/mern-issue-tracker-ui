import React from 'react';
import { withRouter } from 'react-router-dom';

// eslint-disable-next-line react/prefer-stateless-function
class IssueFilter extends React.Component {
  constructor() {
    super();
    this.onStatusChange = this.onStatusChange.bind(this);
  }

  onStatusChange(e) {
    const status = e.target.value;
    const { history } = this.props;

    history.push({
      path: '/issues',
      search: status ? `?status=${status}` : '',
    });
  }

  render() {
    return (
      <div>
        Status
        {' '}
        <select onChange={this.onStatusChange}>
          <option value="">All</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    );
  }
}

export default withRouter(IssueFilter);
