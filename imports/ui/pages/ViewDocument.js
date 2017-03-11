import React from 'react';
import {
  Row,
  Col,
  ButtonToolbar,
  ButtonGroup,
  Button,
  Image
} from 'react-bootstrap';
import {browserHistory} from 'react-router';
import {LinkContainer} from 'react-router-bootstrap';
import {Bert} from 'meteor/themeteorchef:bert';
import {removeDocument} from '../../api/documents/methods.js';

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

const handleRemove = (_id) => {
  if (confirm('Are you sure? This is permanent!')) {
    removeDocument.call({
      _id
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Document deleted!', 'success');
        browserHistory.push('/documents');
        //TODO: after the document deletion, this page tries to refresh and throws and error since the document no longer exists
      }
    });
  }
};

const ViewDocument = ({doc}) => (
  <div className="ViewDocument">
    <Row>
      <Col xs={12}>
        <div className="page-header clearfix">
          <h4 className="pull-left">{doc.title}</h4>
          <ButtonToolbar className="pull-right">
            <ButtonGroup bsSize="small">
              <LinkContainer to={`/documents/${doc._id}/edit`}>
                <Button>
                  <T>common.general.Edit</T>
                </Button>
              </LinkContainer>
              <Button onClick={() => handleRemove(doc._id)} className="text-danger">
                <T>common.general.Delete</T>
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
        </div>
      </Col>
      <Row>
        {doc.items.oil.quantity > 0 && <Col xs={1}>
          <Image src='../oil.png' responsive rounded/></Col>}
        {doc.items.oil.quantity > 0 && <Col xs={3}>
          Total Classic Oil
        </Col>}
        {doc.items.oil.quantity > 0 && <Col xs={1}>
          {doc.items.oil.quantity}
        </Col>}
        {doc.items.oil.quantity > 0 && <Col xs={7}>
          {doc.items.oil.quantity * 10}&nbsp; CHF
        </Col>}
      </Row>
      <Row>
        {doc.items.tire.quantity > 0 && <Col xs={1}>
          <Image src='../tire.png' responsive rounded/></Col>}
        {doc.items.tire.quantity > 0 && <Col xs={3}>
          Winter Tires
        </Col>}
        {doc.items.tire.quantity > 0 && <Col xs={1}>
          {doc.items.tire.quantity}
        </Col>}
        {doc.items.tire.quantity > 0 && <Col xs={7}>
          {doc.items.tire.quantity * 510}&nbsp;CHF
        </Col>}
      </Row>
    </Row>
  </div>
);

ViewDocument.propTypes = {
  doc: React.PropTypes.object.isRequired
};

export default ViewDocument;
