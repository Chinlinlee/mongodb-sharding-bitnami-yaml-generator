import * as generatePassword from 'password-generator';

let maxLength = 18;
let minLength = 12;
let uppercaseMinCount = 3;
let lowercaseMinCount = 3;
let numberMinCount = 2;
let specialMinCount = 2;
let UPPERCASE_RE = /([A-Z])/g;
let LOWERCASE_RE = /([a-z])/g;
let NUMBER_RE = /([\d])/g;
let SPECIAL_CHAR_RE = /([\?\-])/g;
let NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;
 
function isStrongEnough(password: string) {
  let uc = password.match(UPPERCASE_RE);
  let lc = password.match(LOWERCASE_RE);
  let n = password.match(NUMBER_RE);
  let sc = password.match(SPECIAL_CHAR_RE);
  let nr = password.match(NON_REPEATING_CHAR_RE);
  return password.length >= minLength &&
    !nr &&
    uc && uc.length >= uppercaseMinCount &&
    lc && lc.length >= lowercaseMinCount &&
    n && n.length >= numberMinCount &&
    sc && sc.length >= specialMinCount;
}
 
function generateStrongEnoughPassword() {
  let password = "";
  let randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
  while (!isStrongEnough(password)) {
    password = generatePassword.default(randomLength, false, /[\w\d\?\-]/);
  }
  return password;
}

export {
    generateStrongEnoughPassword
}