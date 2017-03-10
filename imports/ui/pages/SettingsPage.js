import React from 'react';
import {
  Row,
  Col,
  Form,
  FormGroup,
  ControlLabel,
  DropdownButton,
  MenuItem
} from 'react-bootstrap';
import LanguageDropDown from '../components/LanguageDropDown.js'

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

export default class SettingsPage extends React.Component {
  render() {
    return (
      <div className="Settings">
        <Row>
          <Col xs={12}>
            <div className="page-header clearfix">
              <h4 className="pull-left">
                <T>common.page.Settings</T>
              </h4>
            </div>
          </Col>
        </Row>
        <Row>
          <Col componentClass={ControlLabel} sm={1}>
            <T>common.general.Language</T>
          </Col>
          <Col sm={11}>
            <LanguageDropDown navbar={false} userSetting={this.props.userSetting}/>
          </Col>
        </Row>
      </div>
    );
  }
};

SettingsPage.propTypes = {
  meteorUser: React.PropTypes.object,
  userSetting: React.PropTypes.object.isRequired
};
