import React from 'react';
import PropTypes from 'prop-types';

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
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="owner" id="new-issue-owner" />
        {' '}
        <input type="text" name="title" id="new-issue-title" />
        {' '}
        <button type="submit">Add</button>
      </form>
    );
  }
}

IssueAdd.propTypes = {
  createIssue: PropTypes.func.isRequired,
};
