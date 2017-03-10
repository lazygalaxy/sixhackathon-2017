import React from 'react';
import {ListGroup, ListGroupItem, Alert} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';

const DocumentsList = ({documents}) => (documents.length > 0
  ? <ListGroup className="DocumentsList">
      {documents.map(({_id, title, attachment}) => (
        <LinkContainer key={_id} to={`/documents/${_id}`}>
          <ListGroupItem>{title}{attachment
              ? " (" + attachment.type + ")"
              : ""}</ListGroupItem>
        </LinkContainer>
      ))}
    </ListGroup>
  : <Alert bsStyle="warning">No documents yet.</Alert>);

DocumentsList.propTypes = {
  documents: React.PropTypes.array
};

export default DocumentsList;
