import React from 'react';
import {NavDropdown, MenuItem, DropdownButton} from 'react-bootstrap';
import {upsertSetting} from '../../api/settings/methods.js';
import i18n from 'meteor/universe:i18n';

export default class LanguageDropDown extends React.Component {
  constructor() {
    super(...arguments);
    //this.onLocale = this.onLocale.bind(this);
  }
  //TODO: cleanup
  // onLocale(locale) {
  //   this.setState({locale: locale});
  //
  //   if (Meteor.user()) {
  //     const upsert = {
  //       _id: Meteor.userId(),
  //       language: locale
  //     };
  //     upsertSetting.call(upsert, (error) => {
  //       if (error) {
  //         Bert.alert(error.reason, 'danger');
  //       } else {
  //         Bert.alert('done', 'success');
  //       }
  //     });
  //
  //   } else {
  //     console.info('no user');
  //   }
  // }

  // componentWillMount() {
  //   i18n.onChangeLocale(this.onLocale);
  // }
  //
  // componentWillUnmount() {
  //   i18n.offChangeLocale(this.onLocale);
  // }

  handleSelect(eventKey) {
    event.preventDefault();

    //only change/save the language if it is different to the transalted locale
    if (eventKey != i18n.getLocale()) {
      if (Meteor.user()) {
        const upsert = {
          _id: Meteor.userId(),
          language: eventKey
        };
        upsertSetting.call(upsert, (error) => {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            i18n.setLocale(eventKey);
            Bert.alert(i18n.__("common", "sentence", "LanguageChange") + i18n.getLanguageNativeName(eventKey), 'success');
          }
        });
      } else {
        i18n.setLocale(eventKey);
      }
    }
  }

  render() {
    //TODO: dynamically acquire the language options
    let languages = ['en', 'de'];

    if (this.props.navbar) {
      return (
        <NavDropdown title={i18n.getLanguageNativeName(this.props.userSetting.language)} id="nav-dropdown" onSelect={this.handleSelect}>
          {languages.map(function(key) {
            return <MenuItem key={key} eventKey={key}>{i18n.getLanguageNativeName(key)}</MenuItem>;
          })}
        </NavDropdown>
      );
    } else {
      return (
        <DropdownButton title={i18n.getLanguageNativeName(this.props.userSetting.language)} id="bg-justified-dropdown" onSelect={this.handleSelect}>
          {languages.map(function(key) {
            return <MenuItem key={key} eventKey={key}>{i18n.getLanguageNativeName(key)}</MenuItem>;
          })}
        </DropdownButton>
      );
    }
  }
}

LanguageDropDown.defaultProps = {
  navbar: true
};

LanguageDropDown.propTypes = {
  navbar: React.PropTypes.bool
};
