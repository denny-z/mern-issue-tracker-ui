import React from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button, ButtonToolbar, Col, ControlLabel, Form, FormControl, FormGroup, Panel,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';
import store from './store.js';
import withToast from './withToast.jsx';
import UserContext from './UserContext.jsx';

class IssueEdit extends React.Component {
  static async fetchData(match, search, showError) {
    const { params: { id } } = match;
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

    const data = await graphQLFetch(query, { id }, showError);
    return data;
  }

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);

    this.showValidation = this.showValidation.bind(this);
    this.hideValidation = this.hideValidation.bind(this);

    const issue = store.initialData ? store.initialData.issue : null;
    delete store.initialData;
    this.state = {
      issue,
      invalidFields: {},
      needShowValidation: false,
    };
  }

  componentDidMount() {
    const { issue } = this.state;
    if (issue == null) this.loadData();
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
    const { match, showError } = this.props;
    const data = await IssueEdit.fetchData(match, null, showError);
    this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.showValidation();
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
    const { showError, showSuccess } = this.props;

    const data = await graphQLFetch(query, { id, changes }, showError);
    if (data) {
      this.setState({ issue: data.updateIssue });
      showSuccess('Updated issue successfully.');
    }
  }

  showValidation() {
    this.setState({ needShowValidation: true });
  }

  hideValidation() {
    this.setState({ needShowValidation: false });
  }

  render() {
    const { issue } = this.state;
    if (issue == null) return null;

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
      needShowValidation,
    } = this.state;

    const { invalidFields } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0 && needShowValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.hideValidation}>
          Please correct invalid fields before sumbitting.
        </Alert>
      );
    }

    const { user } = this.context;

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>{`Editing issue: ${id}`}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>Created</Col>
              <Col sm={9}>
                <FormControl.Static>{created.toDateString()}</FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>Status</Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  name="status"
                  value={status}
                  onChange={this.onChange}
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Closed">Closed</option>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>Owner</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  key={id}
                  tag="input"
                  name="owner"
                  value={owner}
                  onChange={this.onChange}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>Effort</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={NumInput}
                  key={id}
                  name="effort"
                  value={effort}
                  onChange={this.onChange}
                />
              </Col>
            </FormGroup>
            <FormGroup validationState={invalidFields.due ? 'error' : null}>
              <Col sm={3} componentClass={ControlLabel}>Due</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={DateInput}
                  key={id}
                  name="due"
                  value={due}
                  onChange={this.onChange}
                  onValidityChange={this.onValidityChange}
                />
              </Col>
            </FormGroup>
            <FormGroup validationState={invalidFields.title ? 'error' : null}>
              <Col sm={3} componentClass={ControlLabel}>Title</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  key={id}
                  tag="input"
                  name="title"
                  value={title}
                  onChange={this.onChange}
                  checkValid={value => value.trim().length >= 3}
                  onValidityChange={this.onValidityChange}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>Desciption</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  key={id}
                  tag="textarea"
                  name="description"
                  value={description}
                  onChange={this.onChange}
                  rows={4}
                  cols={50}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={6}>
                <ButtonToolbar>
                  {/* TODO: Fix link, when there are selected filters in URL.
                  Can't just get "search" from "location". Need to take a look at "history" obj. */}
                  <LinkContainer to="/issues">
                    <Button bsStyle="link">Back</Button>
                  </LinkContainer>
                  <Button
                    bsStyle="primary"
                    type="submit"
                    disabled={!user.signedIn}
                  >
                    Submit
                  </Button>
                </ButtonToolbar>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={6}>
                {validationMessage}
              </Col>
            </FormGroup>
          </Form>
        </Panel.Body>
        <Panel.Footer>
          <Link to={`/edit/${id - 1}`}>Prev</Link>
          {' | '}
          <Link to={`/edit/${id + 1}`}>Next</Link>
        </Panel.Footer>
      </Panel>
    );
  }
}

IssueEdit.contextType = UserContext;
const IssueEditWithToast = withToast(IssueEdit);
IssueEditWithToast.fetchData = IssueEdit.fetchData;
export default IssueEditWithToast;
