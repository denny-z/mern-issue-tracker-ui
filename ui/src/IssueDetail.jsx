/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import graphQLFetch from './graphQLFetch.js';

export default class IssueDetail extends React.Component {
  constructor() {
    super();
    this.state = { issue: {} };
  }

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    if (id) this.loadData(id);
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } } } = prevProps;
    const { match: { params: { id: newId } } } = this.props;
    if (newId !== prevId) this.loadData(newId);
  }

  async loadData(id) {
    const query = `
      query Issue($id: Int!) {
        issue(id: $id) {
          id
          description
        }
      }
    `;

    const data = await graphQLFetch(query, { id });
    if (data) this.setState({ issue: data.issue });
  }

  renderIssue() {
    const { issue: { id, description } } = this.state;

    return (
      <React.Fragment>
        <h3>Description</h3>
        (Issue ID:
        {` ${id}.)`}
        <br />
        <pre>{description || 'N/A'}</pre>
      </React.Fragment>
    );
  }

  render() {
    const { issue: { id } } = this.state;
    return (
      <div>
        {id ? this.renderIssue() : ''}
      </div>
    );
  }
}
