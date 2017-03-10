import {Meteor} from 'meteor/meteor';
import {composeWithTracker} from 'react-komposer';
import Settings from '../../api/settings/settings.js';
import SettingsPage from '../pages/SettingsPage.js';
import Loading from '../components/Loading.js';

//TODO: this logic is duplicated between AppNavigation & SettingsPage
import i18n from 'meteor/universe:i18n';

function getBrowserLocale() {
  return (navigator.languages && navigator.languages[0] || navigator.language || navigator.browserLanguage || navigator.userLanguage || 'en');
}

function getDefaultUserSettings() {
  let userSetting = {};
  userSetting.language = getBrowserLocale();
  return userSetting;
}

const composer = ({
  params
}, onData) => {
  if (Meteor.userId()) {
    const subscription = Meteor.subscribe('settings.view', Meteor.userId());

    if (subscription.ready()) {
      const userSetting = Settings.findOne();
      onData(null, {
        meteorUser: Meteor.user(),
        userSetting: userSetting || getDefaultUserSettings()
      });
    }
  } else {
    onData(null, {userSetting: getDefaultUserSettings()});
  }
};

export default composeWithTracker(composer, Loading)(SettingsPage);
