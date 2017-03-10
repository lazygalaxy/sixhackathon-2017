import React from 'react';
import DocumentEditor from '../components/DocumentEditor.js';

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

const NewDocument = () => (
  <div className="NewDocument">
    <h4 className="page-header">
      <T>common.page.AddDocument</T>
    </h4>
    <DocumentEditor/>
  </div>
);

export default NewDocument;
