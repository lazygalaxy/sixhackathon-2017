import React from 'react';
import DocumentEditor from '../components/DocumentEditor.js';

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

const EditDocument = ({doc}) => (
  <div className="EditDocument">
    <h4 className="page-header">
      <T>common.page.EditDocument</T>&nbsp;"{doc.title}"</h4>
    <DocumentEditor doc={doc}/>
  </div>
);

EditDocument.propTypes = {
  doc: React.PropTypes.object
};

export default EditDocument;
