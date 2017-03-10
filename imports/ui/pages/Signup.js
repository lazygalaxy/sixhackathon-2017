import React from 'react';
import {Link} from 'react-router';
import {
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from 'react-bootstrap';
import handleSignup from '../../modules/signup';

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

export default class Signup extends React.Component {
  componentDidMount() {
    handleSignup({component: this});
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <div className="Signup">
        <Row>
          <Col xs={12} sm={6} md={4}>
            <h4 className="page-header">
              <T>common.page.SignUp</T>
            </h4>
            <form ref={form => (this.signupForm = form)} onSubmit={this.handleSubmit}>
              <Row>
                <Col xs={6} sm={6}>
                  <FormGroup>
                    <ControlLabel>
                      <T>common.general.FirstName</T>
                    </ControlLabel>
                    <FormControl type="text" ref="firstName" name="firstName"/>
                  </FormGroup>
                </Col>
                <Col xs={6} sm={6}>
                  <FormGroup>
                    <ControlLabel>
                      <T>common.general.LastName</T>
                    </ControlLabel>
                    <FormControl type="text" ref="lastName" name="lastName"/>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <ControlLabel>
                  <T>common.general.Email</T>
                </ControlLabel>
                <FormControl type="text" ref="emailAddress" name="emailAddress"/>
              </FormGroup>
              <FormGroup>
                <ControlLabel>
                  <T>common.general.Password</T>
                </ControlLabel>
                <FormControl type="password" ref="password" name="password"/>
              </FormGroup>
              <Button type="submit" bsStyle="success">
                <T>common.page.SignUp</T>
              </Button>
            </form>
            <p>
              <T>common.sentence.AlreadyAccount</T>&nbsp;
              <Link to="/login">
                <T>common.page.LogIn</T>
              </Link>
            </p>
          </Col>
        </Row>
      </div>
    );
  }
}
