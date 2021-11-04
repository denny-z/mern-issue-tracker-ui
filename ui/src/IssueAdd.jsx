import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Form, FormControl, FormGroup, ControlLabel,
} from 'react-bootstrap';

export default class IssueAdd extends React.Component {
  static get DAYS_10() {
    return 1000 * 60 * 60 * 24 * 10;
  }

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      due: new Date(new Date().getTime() + IssueAdd.DAYS_10),
    };

    // eslint-disable-next-line react/destructuring-assignment
    this.props.createIssue(issue);

    form.owner.value = '';
    form.title.value = '';
  }

  render() {
    return (
      <Form inline onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Owner:</ControlLabel>
          {' '}
          <FormControl type="text" name="owner" />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Title:</ControlLabel>
          {' '}
          <FormControl type="text" name="title" />
        </FormGroup>
        {' '}
        <Button bsStyle="primary" type="submit">Add</Button>
      </Form>
    );
  }
}

IssueAdd.propTypes = {
  createIssue: PropTypes.func.isRequired,
};
