import React from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button, ButtonToolbar, Col, ControlLabel, Form, FormControl, FormGroup, Panel,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { connect } from 'react-redux';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';
import withToast from './withToast.jsx';
import UserContext from './UserContext.jsx';
import {
  loadIssue as loadIssueAction,
  updateIssue as updateIssueAction,
} from './redux/actions.js';
import { getIssue, getIssueLoading } from './redux/selectors.js';

class IssueEdit extends React.Component {
  // eslint-disable-next-line no-unused-vars
  static async fetchData(match, search) {
    const { params: { id } } = match;
    return loadIssueAction(id);
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);

    this.showValidation = this.showValidation.bind(this);
    this.hideValidation = this.hideValidation.bind(this);

    this.showSuccessMessage = this.showSuccessMessage.bind(this);
    this.updateIssueInState = this.updateIssueInState.bind(this);

    this.state = {
      issue: {},
      invalidFields: {},
      needShowValidation: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      match: { params: { id: prevId } },
      initialIssue: prevInitialIssue,
    } = prevProps;
    const {
      match: { params: { id } },
      initialIssue,
    } = this.props;

    if (id !== prevId) {
      this.loadData();
      return;
    }

    if (prevInitialIssue !== initialIssue) {
      this.updateIssueInState();
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

  updateIssueInState() {
    this.setState((prevState) => {
      const { initialIssue } = this.props;

      return {
        ...prevState,
        issue: Object.assign({}, initialIssue),
      };
    });
  }

  async loadData() {
    const {
      match: { params: { id: paramsId } },
      loadIssue,
    } = this.props;
    const id = parseInt(paramsId, 10);

    loadIssue(id, this.updateIssueInState);
  }

  showSuccessMessage() {
    const { showSuccess } = this.props;
    showSuccess('Updated issue successfully.');
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.showValidation();
    const { issue, invalidFields } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;

    const { updateIssue } = this.props;

    updateIssue(issue, this.showSuccessMessage);
  }

  showValidation() {
    this.setState({ needShowValidation: true });
  }

  hideValidation() {
    this.setState({ needShowValidation: false });
  }

  render() {
    const { issue } = this.state;
    const { isLoading } = this.props;

    if (isLoading) return (<h3 className="text-center">Loading form for you...</h3>);
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
          Please correct invalid fields before submitting.
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


const mapStateToProps = (state, ownProps) => {
  const { match: { params: { id: paramsId } } } = ownProps;
  const id = parseInt(paramsId, 10);

  return {
    initialIssue: getIssue(state, id),
    isLoading: getIssueLoading(state, id),
  };
};

const mapDispatchToProps = dispatch => ({
  loadIssue: (id, onSuccess) => {
    dispatch(loadIssueAction(id, onSuccess));
  },
  updateIssue: (issue, onSuccess) => {
    dispatch(updateIssueAction(issue, onSuccess));
  },
});

const Connected = connect(mapStateToProps, mapDispatchToProps)(IssueEdit);
Connected.fetchData = IssueEdit.fetchData;
export default withToast(Connected);
