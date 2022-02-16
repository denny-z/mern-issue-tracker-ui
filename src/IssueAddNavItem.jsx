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
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { issueCreate } from './redux/actions.js';
import UserContext from './UserContext.jsx';
import withToast from './withToast.jsx';

class IssueAddNavItem extends Component {
  constructor(props) {
    super(props);

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
      needShowModal: false,
      owner: '',
      title: '',
    };
  }

  showModal() {
    this.setState({ needShowModal: true });
  }

  hideModal() {
    this.setState({ needShowModal: false });
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.hideModal();

    const { owner, title } = this.state;
    const issue = {
      owner,
      title,
      due: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10), // 10 days later.
    };
    const { onCreate } = this.props;

    const onSuccess = (createdIssue) => {
      const { history } = this.props;
      this.setState({
        owner: '',
        title: '',
      });
      history.push(`/edit/${createdIssue.id}`);
    };

    onCreate(issue, onSuccess);
  }

  render() {
    const { needShowModal } = this.state;
    const { owner, title } = this.state;
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
                <FormControl autoFocus name="title" value={title} onChange={this.handleInputChange} />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Owner</ControlLabel>
                <FormControl name="owner" value={owner} onChange={this.handleInputChange} />
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
const WithToast = withToast(WithRouter);

const mapDispatchToProps = dispatch => ({
  onCreate: (issue, onSuccess) => dispatch(issueCreate(issue, onSuccess)),
});
const Connected = connect(null, mapDispatchToProps)(WithToast);
export default Connected;
