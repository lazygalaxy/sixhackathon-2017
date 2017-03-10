/* eslint-disable max-len */
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {Meteor} from 'meteor/meteor';
import App from '../../ui/layouts/App.js';

//components that require authenticaiton
import Index from '../../ui/pages/Index.js';
import Documents from '../../ui/pages/Documents.js';
import NewDocument from '../../ui/pages/NewDocument.js';
import EditDocument from '../../ui/containers/EditDocument.js';
import ViewDocument from '../../ui/containers/ViewDocument.js';
import SettingsPage from '../../ui/containers/SettingsPage.js';

//components that require no authentication
import Login from '../../ui/pages/Login.js';
import RecoverPassword from '../../ui/pages/RecoverPassword.js';
import ResetPassword from '../../ui/pages/ResetPassword.js';
import Signup from '../../ui/pages/Signup.js';

import NotFound from '../../ui/pages/NotFound.js';

const authenticate = (nextState, replace) => {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    replace({
      pathname: '/login',
      state: {
        nextPathname: nextState.location.pathname
      }
    });
  }
};

Meteor.startup(() => {
  //TODO: seems like the names are not really needed in the route
  render(
    <Router history={browserHistory}>
    <Route path="/" component={App}>
      //routes that require authenticaiton
      <IndexRoute name="index" component={Index} onEnter={authenticate}/>

      <Route name="documents" path="/documents" component={Documents} onEnter={authenticate}/>
      <Route name="newDocument" path="/documents/new" component={NewDocument} onEnter={authenticate}/>
      <Route name="editDocument" path="/documents/:_id/edit" component={EditDocument} onEnter={authenticate}/>
      <Route name="viewDocument" path="/documents/:_id" component={ViewDocument} onEnter={authenticate}/>
      <Route path="/settings" component={SettingsPage} onEnter={authenticate}/>

      //routes that require no authentication
      <Route name="login" path="/login" component={Login}/>
      <Route name="recover-password" path="/recover-password" component={RecoverPassword}/>
      <Route name="reset-password" path="/reset-password/:token" component={ResetPassword}/>
      <Route name="signup" path="/signup" component={Signup}/>

      <Route path="*" component={NotFound}/>
    </Route>
  </Router>, document.getElementById('react-root'));
});
