import React from 'react';
import {FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';
import documentEditor from '../../modules/document-editor.js';

import i18n from 'meteor/universe:i18n';
//instance of translate component with top-level context
const T = i18n.createComponent();

export default class DocumentEditor extends React.Component {
  componentDidMount() {
    documentEditor({component: this});
    setTimeout(() => {
      document.querySelector('[name="title"]').focus();
    }, 0);
  }

  render() {
    const {doc} = this.props;
    return (
      <form ref={form => (this.documentEditorForm = form)} onSubmit={event => event.preventDefault()}>
        <FormGroup>
          <ControlLabel>
            <T>common.general.Title</T>
          </ControlLabel>
          <FormControl type="text" name="title" defaultValue={doc && doc.title} placeholder="Oh, The Places You'll Go!"/>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            <T>common.general.Body</T>
          </ControlLabel>
          <FormControl componentClass="textarea" name="body" defaultValue={doc && doc.body} placeholder="Congratulations! Today is your day. You're off to Great Places! You're off and away!"/>
        </FormGroup>
        <Button type="submit" bsStyle="success">
          {doc && doc._id
            ? <T>common.page.EditDocument</T>
            : <T>common.page.AddDocument</T>}
        </Button>
      </form>
    );
  }
}

DocumentEditor.propTypes = {
  doc: React.PropTypes.object
};
