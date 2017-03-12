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

export default class ViewDocument extends React.Component {
  render() {
    let total = this.props.doc.items.hour.quantity * 300.00 + this.props.doc.items.oil.quantity * 10.00 + this.props.doc.items.tire.quantity * 510.00;

    return (
      <div className="ViewDocument">
        <Row>
          <Col xs={12}>
            <div className="page-header clearfix">
              <h4 className="pull-left">{this.props.doc.title}</h4>
              <ButtonToolbar className="pull-right">
                <ButtonGroup bsSize="small">
                  <LinkContainer to={`/documents/${this.props.doc._id}/edit`}>
                    <Button>
                      <T>common.general.Edit</T>
                    </Button>
                  </LinkContainer>
                  <Button onClick={() => handleRemove(this.props.doc._id)} className="text-danger">
                    <T>common.general.Delete</T>
                  </Button>
                </ButtonGroup>
              </ButtonToolbar>
            </div>
          </Col>
          <Row>
            {this.props.doc.items.hour.quantity > 0 && <Col xs={1}>
              <Image src='../mike.png' responsive rounded/></Col>}
            {this.props.doc.items.hour.quantity > 0 && <Col xs={3}>
              Mechanic Mike Hours
            </Col>}
            {this.props.doc.items.hour.quantity > 0 && <Col xs={1}>
              Qty.&nbsp;{this.props.doc.items.hour.quantity}
            </Col>}
            {this.props.doc.items.hour.quantity > 0 && <Col xs={7}>
              Fr.&nbsp;300.00
            </Col>}
          </Row>
          <Row>
            {this.props.doc.items.oil.quantity > 0 && <Col xs={1}>
              <Image src='../oil.png' responsive rounded/></Col>}
            {this.props.doc.items.oil.quantity > 0 && <Col xs={3}>
              Total Classic Oil
            </Col>}
            {this.props.doc.items.oil.quantity > 0 && <Col xs={1}>
              Qty.&nbsp;{this.props.doc.items.oil.quantity}
            </Col>}
            {this.props.doc.items.oil.quantity > 0 && <Col xs={7}>
              Fr.&nbsp;10.00
            </Col>}
          </Row>
          <Row>
            {this.props.doc.items.tire.quantity > 0 && <Col xs={1}>
              <Image src='../tire.png' responsive rounded/></Col>}
            {this.props.doc.items.tire.quantity > 0 && <Col xs={3}>
              Winter Tires
            </Col>}
            {this.props.doc.items.tire.quantity > 0 && <Col xs={1}>
              Qty.&nbsp;{this.props.doc.items.tire.quantity}
            </Col>}
            {this.props.doc.items.tire.quantity > 0 && <Col xs={7}>
              Fr.&nbsp;510.00
            </Col>}
          </Row>
          <Row>
            <Col xs={1}></Col>
            <Col xs={3}></Col>
            <Col xs={1}>
              Total
            </Col>
            <Col xs={7}>
              Fr.&nbsp;{total}.00
            </Col>
          </Row>
        </Row>
      </div>
    );
  }
};

ViewDocument.propTypes = {
  doc: React.PropTypes.object.isRequired
};
