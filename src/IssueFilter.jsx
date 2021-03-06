import React from 'react';
import { withRouter } from 'react-router-dom';
import URLSearchParams from 'url-search-params';
import {
  ButtonToolbar, Button, FormGroup, FormControl, ControlLabel, InputGroup, Row, Col,
} from 'react-bootstrap';

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
    const { history, urlBase } = this.props;

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (effortMin) params.set('effortMin', effortMin);
    if (effortMax) params.set('effortMax', effortMax);

    const search = params.toString() ? `?${params.toString()}` : '';
    history.push({ path: urlBase, search });
  }

  render() {
    const { status, isChanged } = this.state;
    const { effortMin, effortMax } = this.state;

    return (
      <Row>
        <Col xs={6} sm={4} md={2} lg={2}>
          <FormGroup>
            <ControlLabel>Status:</ControlLabel>
            <FormControl
              componentClass="select"
              value={status}
              onChange={this.onStatusChange}
              bsSize="sm"
            >
              <option value="">All</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="Closed">Closed</option>
            </FormControl>
          </FormGroup>
        </Col>
        <Col xs={6} sm={4} md={2} lg={2}>
          <FormGroup>
            <ControlLabel>Effort between:</ControlLabel>
            <InputGroup>
              <FormControl value={effortMin} onChange={e => this.onEffortChange(e, 'effortMin')} bsSize="sm" />
              <InputGroup.Addon>-</InputGroup.Addon>
              <FormControl value={effortMax} onChange={e => this.onEffortChange(e, 'effortMax')} bsSize="sm" />
            </InputGroup>
          </FormGroup>
        </Col>
        <Col xs={6} sm={4} md={2} lg={2}>
          <FormGroup>
            <ControlLabel>{' '}</ControlLabel>
            <ButtonToolbar>
              <Button type="button" bsStyle="primary" onClick={this.applyFilter}>Apply</Button>
              <Button type="button" onClick={this.showOriginalFilter} disabled={!isChanged}>Reset</Button>
            </ButtonToolbar>
          </FormGroup>
        </Col>
      </Row>
    );
  }
}

export default withRouter(IssueFilter);
