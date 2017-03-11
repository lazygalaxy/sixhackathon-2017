let numbers = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine'
];

let tire = [
  'tire',
  'tires',
  'wheel',
  'wheels',
  'rubber',
  'rubbers'
];
let oil = ['oil', 'oils']

export default function chatbot(annotations) {
  let action = null;
  let who = null;
  let what = null;
  let num = null;

  if (annotations && annotations.entities && annotations.entities.people && annotations.entities.people[0]) {
    who = annotations.entities.people[0];
  }

  if (annotations.tokens) {
    annotations.tokens.forEach(function(token) {
      if (token.tag == 'VERB') {
        action = token.text;
      } else if (token.tag == 'NOUN' && token.text != who) {
        if (tire.indexOf(token.text) > -1) {
          what = 'tire';
        } else if (oil.indexOf(token.text) > -1) {
          what = 'oil';
        } else {
          what = token.text;
        }
      } else if (token.tag == 'NUM') {
        num = parseInt(token.text);
        if (isNaN(num)) {
          num = numbers.indexOf(token.text);
        }
      }
    });

    if (action && what) {
      console.info({action, who, what, num});
      return {action, who, what, num};
    }
  }
  return 'say what?!';
}
