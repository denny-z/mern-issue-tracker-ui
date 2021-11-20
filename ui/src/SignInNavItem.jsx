import React, { Component } from 'react';
import {
  NavDropdown, MenuItem, Modal, NavItem, Button,
} from 'react-bootstrap';
import withToast from './withToast.jsx';

class SignInNavItem extends Component {
  constructor(props) {
    super(props);

    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.state = {
      needShowModal: false,
      disabled: true,
      user: { isSignedIn: false, givenName: '' },
    };
  }

  async componentDidMount() {
    const clientId = window.ENV.GOOGLE_CLIENT_ID;
    if (!clientId) return;
    window.gapi.load('auth2', () => {
      if (!window.gapi.auth2.getAuthInstance()) {
        window.gapi.auth2.init({ client_id: clientId }).then(() => {
          this.setState({ disabled: false });
        });
      }
    });

    await this.loadData();
  }

  async loadData() {
    const apiEndpoint = window.ENV.UI_AUTH_ENDPOINT;
    const response = await fetch(`${apiEndpoint}/user`, {
      method: 'POST',
    });
    const body = await response.text();
    const result = JSON.parse(body);
    const { signedIn: isSignedIn, givenName } = result;
    this.setState({ user: { isSignedIn, givenName } });
  }

  async signIn() {
    this.hideModal();
    const { showError } = this.props;
    let googleToken;
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      googleToken = googleUser.getAuthResponse().id_token;
    } catch (error) {
      showError(`Error authenticating with Google: ${error.error}`);
    }

    try {
      const apiEndpoint = window.ENV.UI_AUTH_ENDPOINT;
      const response = await fetch(`${apiEndpoint}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_token: googleToken }),
      });

      const body = await response.text();
      const result = JSON.parse(body);
      const { signedIn: isSignedIn, givenName } = result;
      this.setState({ user: { isSignedIn, givenName } });
    } catch (error) {
      showError(`Error sign in to app ${error}`);
    }
  }

  signOut() {
    this.setState({ user: { isSignedIn: false, givenName: '' } });
  }

  showModal() {
    const clientId = window.ENV.GOOGLE_CLIENT_ID;
    const { showError } = this.props;
    if (!clientId) {
      showError('Missing environment variable GOOGLE_CLIENT_ID');
      return;
    }

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

    const { needShowModal, disabled } = this.state;

    return (
      <>
        <NavItem onClick={this.showModal}>
          Sign in
        </NavItem>
        <Modal keyboard show={needShowModal} onHide={this.hideModal} bsSize="sm">
          <Modal.Header closeButton>
            <Modal.Title>Sign in</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button block bsStyle="primary" onClick={this.signIn} disabled={disabled}>
              <img src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" alt="Sign In" />
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

export default withToast(SignInNavItem);
