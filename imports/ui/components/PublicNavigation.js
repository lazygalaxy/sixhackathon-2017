import React from 'react';
import {LinkContainer} from 'react-router-bootstrap';
import {Nav, NavItem} from 'react-bootstrap';
import LanguageDropDown from './LanguageDropDown.js'

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

export default class PublicNavigation extends React.Component {
  render() {
    return (
      <div>
        <Nav pullRight>
          <LanguageDropDown userSetting={this.props.userSetting}/>
          <LinkContainer to="signup">
            <NavItem eventKey={3} href="/signup">
              <T>common.page.SignUp</T>
            </NavItem>
          </LinkContainer>
          <LinkContainer to="login">
            <NavItem eventKey={4} href="/login">
              <T>common.page.LogIn</T>
            </NavItem>
          </LinkContainer>
        </Nav>
      </div>
    );
  }
};
