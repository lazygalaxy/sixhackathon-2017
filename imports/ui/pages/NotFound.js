import React from 'react';
import {Alert} from 'react-bootstrap';

//TODO: update with a "this is not the page you are looking for banner"
const NotFound = () => (
  <div className="NotFound">
    <Alert bsStyle="danger">
      <p>
        <strong>Error [404]</strong>: {window.location.pathname}&nbsp;does not exist.</p>
    </Alert>
  </div>
);

export default NotFound;
