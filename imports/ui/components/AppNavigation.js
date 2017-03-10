import React from 'react';
import {Navbar} from 'react-bootstrap';
import {Link} from 'react-router';
import PublicNavigation from './PublicNavigation.js';
import AuthenticatedNavigation from './AuthenticatedNavigation.js';
import i18n from 'meteor/universe:i18n';

export default class AppNavigation extends React.Component {
  constructor() {
    super(...arguments);

    if (this.props.userSetting.language != i18n.getLocale()) {
      i18n.setLocale(this.props.userSetting.language);
      console.info("language set to " + this.props.userSetting.language);
    }
  }

  renderNavigation() {
    return (this.props.meteorUser
      ? <AuthenticatedNavigation/>
      : <PublicNavigation userSetting={this.props.userSetting}/>);
  }

  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">LazyBat</Link>
          </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
          {this.renderNavigation()}
        </Navbar.Collapse>
      </Navbar>
    );
  }
};

AppNavigation.propTypes = {
  meteorUser: React.PropTypes.object,
  userSetting: React.PropTypes.object.isRequired
};
