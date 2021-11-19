import React from 'react';
import { withRouter } from 'react-router-dom';
import SelectAsync from 'react-select/lib/Async';

import withToast from './withToast.jsx';
import graphQLFetch from './graphQLFetch.js';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.loadOptions = this.loadOptions.bind(this);
  }

  onChangeSelection({ value }) {
    const { history } = this.props;
    history.push(`/edit/${value}`);
  }

  async loadOptions(term) {
    if (term.length < 3) return [];
    const query = `query SearchIssue($search: String) {
      issuesList(search: $search) {
        issues { id title }
      }
    }`;
    const { showError } = this.props;
    const data = await graphQLFetch(query, { search: term }, showError);
    if (!data || data.issuesList == null) return [];
    return data.issuesList.issues.map(issue => ({ label: `#${issue.id}: ${issue.title}`, value: issue.id }));
  }

  render() {
    return (
      <SelectAsync
        instanceId="search-select"
        value=""
        loadOptions={this.loadOptions}
        filterOption={() => true}
        onChange={this.onChangeSelection}
        components={{ DropdownIndicator: null }}
      />
    );
  }
}

export default withRouter(withToast(Search));
