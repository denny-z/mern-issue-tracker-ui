import React from 'react';
import { withRouter } from 'react-router-dom';
import URLSearchParams from 'url-search-params';

// eslint-disable-next-line react/prefer-stateless-function
class IssueFilter extends React.Component {
  constructor({ location: { search } }) {
    super();
    const params = new URLSearchParams(search);
    this.state = {
      status: params.get('status') || '',
      effortMin: params.get('effortMin') || '',
      effortMax: params.get('effortMax') || '',
      isChanged: false,
    };

    this.onStatusChange = this.onStatusChange.bind(this);
    this.onEffortChange = this.onEffortChange.bind(this);
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

  onEffortChange(e, prop) {
    const effortString = e.target.value;
    if (effortString.match(/^\d*$/)) {
      const newState = { isChanged: true };
      newState[prop] = effortString;
      this.setState(newState);
    }
  }

  showOriginalFilter() {
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    this.setState({
      status: params.get('status') || '',
      effortMin: params.get('effortMin') || '',
      effortMax: params.get('effortMax') || '',
      isChanged: false,
    });
  }

  applyFilter() {
    const { status, effortMin, effortMax } = this.state;
    const { history } = this.props;

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (effortMin) params.set('effortMin', effortMin);
    if (effortMax) params.set('effortMax', effortMax);

    const search = params.toString() ? `?${params.toString()}` : '';
    history.push({ path: '/issues', search });
  }

  render() {
    const { status, isChanged } = this.state;
    const { effortMin, effortMax } = this.state;

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
        Effort between
        <input
          size="5"
          value={effortMin}
          onChange={e => this.onEffortChange(e, 'effortMin')}
        />
        {' - '}
        <input
          size="5"
          value={effortMax}
          onChange={e => this.onEffortChange(e, 'effortMax')}
        />
        {' | '}
        <button type="button" onClick={this.applyFilter}>Apply</button>
        {' '}
        <button type="button" onClick={this.showOriginalFilter} disabled={!isChanged}>Reset</button>
      </div>
    );
  }
}

export default withRouter(IssueFilter);
