import React from 'react';
import { Link } from 'react-router-dom';
import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';

export default class IssueEdit extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);

    this.state = { issue: {}, invalidFields: {} };
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } } } = prevProps;
    const { match: { params: { id } } } = this.props;
    if (id !== prevId) {
      this.loadData();
    }
  }

  onValidityChange(event, isValid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !isValid };
      if (isValid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  onChange(event, naturalValue) {
    const { name, value: textValue } = event.target;
    const value = naturalValue === undefined ? textValue : naturalValue;

    this.setState(prevState => ({
      issue: { ...prevState.issue, [name]: value },
    }));
  }

  async loadData() {
    const { match: { params: { id } } } = this.props;
    const query = `
      query IssueForEdit($id: Int!) {
        issue(id: $id) {
          id
          title
          description
          status
          owner
          created
          due
          effort
        }
      }
    `;

    const data = await graphQLFetch(query, { id });

    this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { issue, invalidFields } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;

    const query = `
      mutation UpdateIssue($id: Int!, $changes: IssueUpdateInputs!) {
        updateIssue(id: $id, changes: $changes) {
          id
          title
          status
          owner
          effort
          created
          due
          description
        }
      }
    `;

    const { id, created, ...changes } = issue;

    const data = await graphQLFetch(query, { id, changes });
    if (data) {
      this.setState({ issue: data.updateIssue });
      // eslint-disable-next-line no-alert
      alert('Issue updated successully');
    }
  }

  render() {
    const { issue: { id } } = this.state;
    const { match: { params: { id: propsId } } } = this.props;

    if (id == null) {
      // eslint-disable-next-line eqeqeq
      if (id != propsId) {
        return (<h3>{`Issue with ID ${propsId} not found.`}</h3>);
      }
      return null;
    }

    const {
      issue: {
        title, description, status, owner, effort, created, due,
      },
    } = this.state;

    const { invalidFields } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0) {
      validationMessage = (
        <div className="error">
          Please correct invalid fields before sumbitting.
        </div>
      );
    }

    return (
      <div>
        <h3>{`Editing issue: ${id}`}</h3>
        <form onSubmit={this.handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td>Created:</td>
                <td>{created.toDateString()}</td>
              </tr>
              <tr>
                <td>Status:</td>
                <td>
                  <select name="status" value={status} onChange={this.onChange}>
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Owner:</td>
                <td>
                  <TextInput key={id} tag="input" name="owner" value={owner} onChange={this.onChange} />
                </td>
              </tr>
              <tr>
                <td>Effort:</td>
                <td>
                  <NumInput key={id} name="effort" value={effort} onChange={this.onChange} />
                </td>
              </tr>
              <tr>
                <td>Due:</td>
                <td>
                  <DateInput key={id} name="due" value={due} onChange={this.onChange} onValidityChange={this.onValidityChange} />
                </td>
              </tr>
              <tr>
                <td>Title:</td>
                <td>
                  <TextInput key={id} tag="input" name="title" value={title} onChange={this.onChange} size={50} />
                </td>
              </tr>
              <tr>
                <td>Description:</td>
                <td>
                  <TextInput
                    key={id}
                    tag="textarea"
                    name="description"
                    cols="50"
                    rows="8"
                    value={description}
                    onChange={this.onChange}
                  />
                </td>
              </tr>
              <tr>
                <td />
                <td><button type="submit">Submit</button></td>
              </tr>
            </tbody>
          </table>
        </form>
        {validationMessage}
        <div>
          <Link to={`/edit/${id - 1}`}>Prev</Link>
          {' | '}
          <Link to={`/edit/${id + 1}`}>Next</Link>
        </div>
      </div>
    );
  }
}
