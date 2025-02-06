const chalk = require("chalk");
const log = console.log;

module.exports = { consoleLog, roomId, shuffleArray, newStringCharacter };

function consoleLog(type, message) {
   switch (type) {
      case "standard":
         log(chalk.gray(message));
         break;
      case "info":
         log(chalk.blue('[?]') + " " + chalk.gray(message));
         break;
      case "alert":
         log(chalk.red('[ALERT]') + " " + chalk.gray(message));
         break;
      case "warning":
         log(chalk.yellow('[WARNING]') + " " + chalk.gray(message));
         break;
      case "positive":
         log(chalk.green('[+]') + " " + chalk.gray(message));
         break;
      case "negative":
         log(chalk.red('[-]') + " " + chalk.gray(message));
         break;
      default:
         log(chalk.gray(`${message}`));
   }
}

function roomId() {
   return Math.random().toString(36).substring(2, 9);
}

function shuffleArray(inputArray) {
   inputArray.sort(() => Math.random() - 0.5);
}

function newStringCharacter(chaine) {
   String.prototype.sansAccent = function () {
      var accent = [
         /[\300-\306]/g, /[\340-\346]/g, // A, a
         /[\310-\313]/g, /[\350-\353]/g, // E, e
         /[\314-\317]/g, /[\354-\357]/g, // I, i
         /[\322-\330]/g, /[\362-\370]/g, // O, o
         /[\331-\334]/g, /[\371-\374]/g, // U, u
         /[\321]/g, /[\361]/g, // N, n
         /[\307]/g, /[\347]/g, // C, c
      ];
      var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

      var str = this;
      for (var i = 0; i < accent.length; i++) {
         str = str.replace(accent[i], noaccent[i]);
      }

      return str;
   }
   chaine = chaine.sansAccent().replace(/([-,.€~!@"'#$%^&*()_+=`{}\[\]\|\\:;'<>])+/g, '');
   chaine = chaine.replace(/[^\x00-\x7F]/g, "");

   return chaine.substring(0, 16);
}