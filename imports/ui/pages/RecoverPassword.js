import React from 'react';
import {
  Row,
  Col,
  Alert,
  FormGroup,
  FormControl,
  Button,
  ControlLabel
} from 'react-bootstrap';
import handleRecoverPassword from '../../modules/recover-password';

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

export default class RecoverPassword extends React.Component {
  componentDidMount() {
    handleRecoverPassword({component: this});
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <div className="RecoverPassword">
        <Row>
          <Col xs={12} sm={6} md={4}>
            <h4 className="page-header">
              <T>common.page.RecoverPassword</T>
            </h4>
            <Alert bsStyle="info">
              <T>common.sentence.EnterEmail</T>
            </Alert>
            <form ref={form => (this.recoverPasswordForm = form)} className="recover-password" onSubmit={this.handleSubmit}>
              <FormGroup>
                <ControlLabel>
                  <T>common.general.Email</T>
                </ControlLabel>
                <FormControl type="email" ref="emailAddress" name="emailAddress"/>
              </FormGroup>
              <Button type="submit" bsStyle="success">
                <T>common.page.RecoverPassword</T>
              </Button>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}
