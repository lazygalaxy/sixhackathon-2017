import React from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import DocumentsList from '../containers/DocumentsList.js';

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

const Documents = () => (
  <div className="Documents">
    <Row>
      <Col xs={12}>
        <div className="page-header clearfix">
          <h4 className="pull-left">
            <T>common.page.Documents</T>
          </h4>
          <LinkContainer to="/documents/new">
            <Button bsStyle="success" className="pull-right">
              <T>common.page.AddDocument</T>
            </Button>
          </LinkContainer>
        </div>
        <DocumentsList/>
      </Col>
    </Row>
  </div>
);

export default Documents;
