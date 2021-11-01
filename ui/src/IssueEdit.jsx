import React from 'react';
import { Link } from 'react-router-dom';
import graphQLFetch from './graphQLFetch.js';

export default class IssueEdit extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onEffortChange = this.onEffortChange.bind(this);

    this.state = { issue: {} };
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

  onChange(event) {
    const { name, value } = event.target;
    this.setState(prevState => ({
      issue: { ...prevState.issue, [name]: value },
    }));
  }

  // TODO: Add validation of "due" input field similar to current.
  onEffortChange(event) {
    const { value } = event.target;
    if (value.match(/^\d*$/)) {
      this.onChange(event);
    }
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

    if (!data) {
      this.setState({ issue: {} });
    } else {
      const { issue } = data;
      issue.title = issue.title != null ? issue.title : '';
      issue.description = issue.description != null ? issue.description : '';
      issue.status = issue.status != null ? issue.status : '';
      issue.owner = issue.owner != null ? issue.owner : '';
      issue.effort = issue.effort != null ? issue.effort.toString() : '';
      issue.due = issue.due != null ? issue.due.toDateString() : '';
      this.setState({ issue });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    // eslint-disable-next-line no-console
    console.log('Fake submitting...');
    // eslint-disable-next-line no-console
    console.log(this.state);
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
                  <input type="text" name="owner" value={owner} onChange={this.onChange} />
                </td>
              </tr>
              <tr>
                <td>Effort:</td>
                <td>
                  <input type="text" name="effort" value={effort} onChange={this.onEffortChange} />
                </td>
              </tr>
              <tr>
                <td>Due:</td>
                <td>
                  <input type="text" name="due" value={due} onChange={this.onChange} />
                </td>
              </tr>
              <tr>
                <td>Title:</td>
                <td>
                  <input type="text" name="title" value={title} onChange={this.onChange} size={50} />
                </td>
              </tr>
              <tr>
                <td>Description:</td>
                <td>
                  <textarea
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
        <div>
          <Link to={`/edit/${id - 1}`}>Prev</Link>
          {' | '}
          <Link to={`/edit/${id + 1}`}>Next</Link>
        </div>
      </div>
    );
  }
}
