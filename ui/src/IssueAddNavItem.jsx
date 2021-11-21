import React, { Component } from 'react';
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Glyphicon, Modal, NavItem, OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import graphQLFetch from './graphQLFetch.js';
import UserContext from './UserContext.jsx';
import withToast from './withToast.jsx';

class IssueAddNavItem extends Component {
  constructor(props) {
    super(props);

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      needShowModal: false,
    };
  }

  showModal() {
    this.setState({ needShowModal: true });
  }

  hideModal() {
    this.setState({ needShowModal: false });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.hideModal();
    const form = document.forms.addIssue;
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      due: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10), // 10 days later.
    };
    const query = `mutation AddIssue($issue: IssueInputs!) {
      addIssue(issue: $issue) {
        id
      }  
    }`;
    const { showError } = this.props;
    const data = await graphQLFetch(query, { issue }, showError);
    if (data) {
      const { history } = this.props;
      history.push(`/edit/${data.addIssue.id}`);
    }
  }

  render() {
    const { needShowModal } = this.state;
    const { user: { signedIn } } = this.context;

    return (
      <React.Fragment>
        <NavItem disabled={!signedIn} onClick={this.showModal}>
          <OverlayTrigger
            placement="left"
            delayShow={1000}
            overlay={<Tooltip id="create-issue">Create Issue</Tooltip>}
          >
            <Glyphicon glyph="plus" />
          </OverlayTrigger>
        </NavItem>
        <Modal keyboard show={needShowModal} onHide={this.hideModal}>
          <Modal.Header closeButton>
            <Modal.Title>Create Issue</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form name="addIssue">
              <FormGroup>
                <ControlLabel>Title</ControlLabel>
                <FormControl autoFocus name="title" />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Owner</ControlLabel>
                <FormControl name="owner" />
              </FormGroup>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button bsStyle="link" onClick={this.hideModal}>Close</Button>
              <Button
                type="submit"
                bsStyle="primary"
                onClick={this.handleSubmit}
              >
                Submit
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

IssueAddNavItem.contextType = UserContext;
const WithRouter = withRouter(IssueAddNavItem);
delete WithRouter.contextType;
export default withToast(WithRouter);
