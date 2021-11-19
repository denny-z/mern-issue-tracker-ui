import React, { Component } from 'react';
import {
  NavDropdown, MenuItem, Modal, NavItem, Button,
} from 'react-bootstrap';

export default class SignInNavItem extends Component {
  constructor(props) {
    super(props);

    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.state = {
      needShowModal: false,
      user: { isSignedIn: false, givenName: '' },
    };
  }

  signIn() {
    this.hideModal();
    this.setState({ user: { isSignedIn: true, givenName: 'User1' } });
  }

  signOut() {
    this.setState({ user: { isSignedIn: false, givenName: '' } });
  }

  showModal() {
    this.setState({ needShowModal: true });
  }

  hideModal() {
    this.setState({ needShowModal: false });
  }

  render() {
    const { user } = this.state;
    if (user.isSignedIn) {
      return (
        <NavDropdown title={user.givenName} id="user">
          <MenuItem onClick={this.signOut}>Sign out</MenuItem>
        </NavDropdown>
      );
    }

    const { needShowModal } = this.state;

    return (
      <>
        <NavItem onClick={this.showModal}>
          Sign in
        </NavItem>
        <Modal keybord show={needShowModal} onHide={this.hideModal} bsSize="sm">
          <Modal.Header closeButton>
            <Modal.Title>Sign in</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button block bsStyle="primary" onClick={this.signIn}>
              Sign in
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="link" onClick={this.hideModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
