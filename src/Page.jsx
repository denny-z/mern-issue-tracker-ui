import React from 'react';
import {
  Navbar, Nav, NavItem, Glyphicon, NavDropdown, MenuItem, Grid, Col,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Contents from './Contents.jsx';
import graphQLFetch from './graphQLFetch.js';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import Search from './Search.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import simpleStore from './store.js';
import UserContext from './UserContext.jsx';

function NavBar({ onUserChange }) {
  return (
    // IMP-DIFF: Added fluid attribute to make it look pretier on wide screens.
    <Navbar fluid>
      <Navbar.Header>
        <Navbar.Brand>Issue Tracker</Navbar.Brand>
      </Navbar.Header>
      <Nav>
        <LinkContainer exact to="/">
          <NavItem>Home</NavItem>
        </LinkContainer>
        <LinkContainer to="/issues">
          <NavItem>Issue List</NavItem>
        </LinkContainer>
        <LinkContainer to="/report">
          <NavItem>Report</NavItem>
        </LinkContainer>
      </Nav>
      <Col xs={5}>
        <Navbar.Form>
          <Search />
        </Navbar.Form>
      </Col>
      <Nav pullRight>
        <IssueAddNavItem />
        <SignInNavItem onUserChange={onUserChange} />
        <NavDropdown
          id="user-dropdown"
          title={<Glyphicon glyph="option-vertical" />}
          noCaret
        >
          <LinkContainer to="/about">
            <MenuItem>About</MenuItem>
          </LinkContainer>
        </NavDropdown>
      </Nav>
    </Navbar>
  );
}

function Footer() {
  return (
    <React.Fragment>
      <hr />
      <p className="text-center">
        <small>All (almost) source code is from &quot;Pro MERN Stack&quot; Edition 2 book.</small>
      </p>
    </React.Fragment>
  );
}

export default class Page extends React.Component {
  static async fetchData(match, search, showError, cookie) {
    const query = `query User {
      user { signedIn givenName }
    }`;

    const data = await graphQLFetch(query, {}, showError, cookie);
    return data;
  }

  constructor(props) {
    super(props);
    this.onUserChange = this.onUserChange.bind(this);

    const user = simpleStore.userData ? simpleStore.userData.user : null;
    delete simpleStore.userData;
    this.state = { user };
  }

  async componentDidMount() {
    const { user } = this.state;
    if (!user) {
      const data = await Page.fetchData();
      this.setState({ user: data.user });
    }
  }

  onUserChange(user) {
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    if (!user) return null;

    return (
      <div>
        <UserContext.Provider value={{ user, onUserChange: this.onUserChange }}>
          <NavBar />
          <Grid fluid>
            <Contents />
          </Grid>
          <Footer />
        </UserContext.Provider>
      </div>
    );
  }
}
