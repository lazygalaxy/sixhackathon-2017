export default function chatbot(annotations) {
  let action = null;
  let who = null;
  let what = null;

  if (annotations && annotations.entities && annotations.entities.people && annotations.entities.people[0]) {
    who = annotations.entities.people[0];
  }

  if (annotations.tokens) {
    annotations.tokens.forEach(function(token) {
      if (token.tag == 'VERB') {
        action = token.text;
      } else if (token.tag == 'NOUN' && token.text != who) {
        what = token.text;
      }
    });

    if (action && who && what) {
      console.info({action, who, what});
      return {action, who, what};
    }
  }
  return 'say what?!';
}
