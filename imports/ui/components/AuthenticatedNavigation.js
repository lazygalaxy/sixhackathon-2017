import React from 'react';
import {browserHistory} from 'react-router';
import {IndexLinkContainer, LinkContainer} from 'react-router-bootstrap';
import {Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import {Meteor} from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

//instance of translate component with top-level context
const T = i18n.createComponent();

const handleLogout = () => Meteor.logout(() => browserHistory.push('/login'));

const userName = () => {
  const user = Meteor.user();
  const name = user && user.profile
    ? user.profile.name
    : '';
  return user
    ? `${name.first} ${name.last}`
    : '';
};

export default class AuthenticatedNavigation extends React.Component {
  render() {
    return (
      <div>
        <Nav pullLeft>
          <IndexLinkContainer to="/">
            <NavItem eventKey={1}>
              <T>common.page.Index</T>
            </NavItem>
          </IndexLinkContainer>
          <LinkContainer to="/documents">
            <NavItem eventKey={2}>
              <T>common.page.Documents</T>
            </NavItem>
          </LinkContainer>
        </Nav>
        <Nav pullRight>
          <NavDropdown eventKey={3} title={userName()} id="basic-nav-dropdown">
            <LinkContainer to="/settings">
              <MenuItem eventKey={3.1}>
                <T>common.page.Settings</T>
              </MenuItem>
            </LinkContainer>
            <MenuItem eventKey={3.2} onClick={handleLogout}>
              <T>common.page.LogOut</T>
            </MenuItem>
          </NavDropdown>
        </Nav>
      </div>
    );
  }
};
