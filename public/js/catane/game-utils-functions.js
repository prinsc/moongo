import * as main from './index.js';

const animSpeed = 800;
const src = "/medias/assets/games/catane/sound/";

var mm = "0";
var ss = "0";
let zoom = 1;

let i = 0;

var sfx = {
   "dice": new Howl({
      volume: 1,
      src: [src + "dice4.wav"]
   }),
   "btn5": new Howl({
      volume: 1,
      src: [src + "btn5.wav"]
   }),
   "btn3": new Howl({
      volume: 1,
      src: [src + "btn3.wav"]
   }),
   "deep-whoosh": new Howl({
      volume: 0.1,
      src: [src + "deep-whoosh.wav"]
   }),
   "message-receive": new Howl({
      volume: 1,
      src: [src + "message-receive.wav"]
   }),
   "port": new Howl({
      volume: 0.1,
      src: [src + "port2.wav"]
   }),
   "pop": new Howl({
      volume: 0.4,
      src: [src + "pop.wav"]
   }),
   "pop_": new Howl({
      volume: 0.2,
      src: [src + "pop_.wav"]
   }),
   "key-insertion": new Howl({
      volume: 0.5,
      src: [src + "key-insertion.wav"]
   }),
   "unlock": new Howl({
      volume: 0.5,
      src: [src + "unlock.wav"]
   }),
   "lock": new Howl({
      volume: 0.5,
      src: [src + "lock.wav"]
   }),
   "place1": new Howl({
      volume: 0.25,
      src: [src + "place1.wav"]
   }),
   "place2": new Howl({
      volume: 0.25,
      src: [src + "place2.wav"]
   }),
   "loose": new Howl({
      volume: 0.25,
      src: [src + "loose.wav"]
   })
};


const replaceCtn = function (element) {
   new TxtAnime(element, {
      effect: 'txt-an-1',
      delayStart: 0,
      delay: 0.01,
      duration: 0.05,
      repeat: false
   })
};

if (localStorage.getItem("zoom")) zoom = (Math.round(localStorage.getItem("zoom") * 100) / 100);

$(".visual").css("transform", "scale(" + zoom + ")");
$(".interactif").css({ "transform": "scale(" + zoom + ")", "z-index": "110" });

/**
 * Après un délai, supprimez la classe fadeIn, ajoutez la classe fadeOut, après la vitesse d'animation,
 * supprimez la classe fadeOut, si l'élément n'a pas la classe fadeIn, ajoutez la classe d-none.
 * @param element - L'élément à masquer.
 * @param delay - Délai en millisecondes avant que l'élément ne soit masqué.
 */
export function hideElement(element, delay) {
   setTimeout(() => {
      element.removeClass('fadeIn');
      element.addClass('fadeOut');
      setTimeout(() => {
         element.removeClass('fadeOut');
         if (!element.hasClass('fadeIn')) element.addClass('d-none');
      }, animSpeed);
      return true;
   }, delay);
   return true;
}

/**
 * Si l'élément a la classe 'd-none', supprimez la classe 'fadeOut', supprimez la classe 'd-none',
 * ajoutez la classe 'fadeIn', et après la vitesse d'animation, supprimez la classe 'fadeIn'.
 * @param element - L'élément à afficher.
 * @param delay - Le délai en millisecondes avant que l'élément ne soit affiché.
 */
export function showElement(element, delay) {
   if (element.hasClass("d-none")) {
      setTimeout(() => {
         element.removeClass('fadeOut');
         element.removeClass('d-none');
         element.addClass('fadeIn');
         setTimeout(() => {
            element.removeClass('fadeIn');
         }, animSpeed);
         return true;
      }, delay);
   }
   return true;
}

/**
 * Afficher un élément pendant un certain temps.
 * @param element - L'élément à afficher.
 * @param time - Le temps en millisecondes pendant lequel l'élément sera affiché.
 * @returns vrai.
 */
export function temporaryShowElement(element, time) {
   showElement(element, 0);
   hideElement(element, time);
   return true;
}

/**
 * Si les secondes sont égales à 60, alors remettez les secondes à 0 et ajoutez 1 aux minutes. Si les
 * minutes comportent moins de 2 chiffres, ajoutez un 0 devant les minutes. Si les secondes comportent
 * moins de 2 chiffres, ajoutez un 0 devant les secondes. Ensuite, mettez à jour la minuterie avec les
 * nouvelles minutes et secondes.
 */
export function updateTimer() {
   ss++;
   if (ss == 60) {
      ss = 0;
      mm++;
   }

   if (mm.toString().length < 2) mm = "0" + mm;
   if (ss.toString().length < 2) ss = "0" + ss;

   $("#timer").html(mm + ":" + ss);
}

/**
 * La fonction playInterval() appelle la fonction updateTimer() puis définit un intervalle pour appeler
 * la fonction updateTimer() toutes les secondes.
 * @returns vrai.
 */
export function playInterval() {
   updateTimer();
   let interval = setInterval(function () { updateTimer() }, 1000);
   return true;
}

/**
 * La fonction stopInterval() efface l'intervalle et renvoie true.
 * @returns la valeur de l'intervalle variable.
 */
export function stopInterval() {
   clearInterval(interval);
   return true;
}

/**
 * Si le chronomètre est en cours d'exécution, arrêtez-le, réinitialisez le chronomètre et renvoyez
 * true. Sinon, renvoie faux.
 * @returns la valeur de vrai.
 */
export function resetInterval() {
   ss = 0;
   mm = 0;
   return true;
}

/**
 * Lorsque le bouton est cliqué, ajoutez la classe wobble-hor-bottom, supprimez la classe fadeIn et
 * après la vitesse d'animation, supprimez la classe wobble-hor-bottom.
 * @param btn - Le bouton à animer
 * @returns vrai.
 */
export function bringButton(btn) {
   $(btn).addClass("wobble-hor-bottom");
   $(btn).removeClass("fadeIn");
   setTimeout(function () {
      $(btn).removeClass("wobble-hor-bottom");
      return true;
   }, animSpeed);
}

/**
 * Si le zoom est inférieur à 1,8, ajoutez 0,05 à la variable de zoom, et si le zoom est supérieur à
 * 0,2, soustrayez 0,05 à la variable de zoom.
 * @param direction - "dedans ou dehors"
 */
export function zoomMap(direction) {
   if (direction === "in") {
      if (zoom < 1.8) {
         zoom = zoom + 0.05;
         $(".visual").css("transform", "scale(" + zoom + ")");
         $(".interactif").css({
            "transform": "scale(" + zoom + ")",
            "z-index": "110"
         });
         localStorage.setItem("zoom", zoom);
      }

   }
   else {
      if (zoom > 0.2) {
         zoom = zoom - 0.05;
         $(".visual").css("transform", "scale(" + zoom + ")");
         $(".interactif").css({
            "transform": "scale(" + zoom + ")",
            "z-index": "110"
         });
         // localStorage.setItem("zoom", typeof zoom === 'number' ? zoom.toFixed(2) : 1.8);
         localStorage.setItem("zoom", zoom);
      }

   }

}

/**
 * Il prend 3 arguments, un numéro du joueur, un nom et un message.
 * Il crée ensuite un nouvel objet de date et le formate en une chaîne d'heure.
 * Il vérifie ensuite si le numéro du joueur est 4, si c'est le cas, il ajoute un message à la div
 * consoleContent, sans nom.
 * Si le numéro du joueur n'est pas 4, il ajoute un message à la div consoleContent, avec un nom.
 * Le nom est formaté avec une classe, qui est le numéro du joueur.
 * Le numéro du joueur est utilisé pour déterminer la couleur du nom.
 * Le numéro du joueur est également utilisé pour déterminer la couleur du message.
 * Le numéro du joueur est également utilisé pour déterminer la couleur de l'heure.
 * Le numéro du joueur est également utilisé pour déterminer la couleur de la bordure.
 * @param order - L'ordre du joueur.
 * @param who - Le nom du joueur qui a envoyé le message.
 * @param txt - Le texte à afficher
 */
export function announce(order, who, txt, nb_message) {

   var d = new Date();
   var time = d.toLocaleTimeString();
   var message = "";

   if (order === 4) {
      if (who === "catane") {
         message = `
      <div class="message m${nb_message}" >
         <span class="message-content">${txt}</span>
      </div > `
      }
      else {
         message = `
         <div class="message m${nb_message}" >
         <span class="time">${time}</span>
         <span class="message-content">${txt}</span>
      </div > `
      }

   }
   else {
      message = `
               <div class="message m${nb_message}" >
            <span class="time">${time}</span>
            <span class="who">[<b class="c-${order}">${who}</b>]</span>
            <span class="message-content">${txt}</span>
         </div > `;
   }

   main.consoleContent.prepend(message);
   return txt;
}

/**
 * Il prend un type et un texte, puis il crée un div avec une classe de message-big, puis il ajoute un
 * span avec une classe de titre, puis il ajoute un span, puis il ajoute le html au consoleContent div.
 * @param type - 1 = titre, 2 = erreur, 3 = succès, 4 = avertissement
 * @param txt - un tableau de chaînes
 * @returns vrai.
 */
export function announceBig(type, txt) {
   let html = "";
   if (type === 1) {
      html += `<div class="message-big">`;
      for (i = 0; i < txt.length; i++) {
         if (i == 0) html += `<span class="title">${txt[i]}</span>`;
         else html += `<span>${txt[i]}</span>`;
      }
      html += `</div>`;
   }
   else if (type == 2) {
      html += `<div class="message-big"><span>${txt}</span></div>`
   }
   main.consoleContent.prepend(html);
   return true;
}

/**
 * Il remplace le contenu d'un élément par un nouveau contenu, mais uniquement si le nouveau contenu
 * est différent de l'ancien contenu.
 * @param element - L'élément dont vous souhaitez remplacer le contenu.
 * @param newContent - Le nouveau contenu pour remplacer l'ancien contenu.
 */
export function replaceContent(element, newContent) {

   if (element.html() != undefined) {
      // console.log(element)
      // replaceCtn(element[0]);
      if (element.html() != newContent) {
         element.css({
            "transfrom": "scale(0.5)",
            "left": "-25px"
         });
         setTimeout(() => {
            $(element).html(newContent);
            element.css({
               "transfrom": "scale(1)",
               "left": "0"
            });
         }, 400);
      }
   }


}


/**
 * Il joue un son.
 * @param sound - le nom du fichier son à jouer
 */


export function playSound(sound) {
   sfx[sound].play();

   console.log('Play "' + sound + '" audio');

   // audio.once('load', function () {
   //    audio.play();
   // });

   // let audio = new Audio();

   // audio.src = "/medias/assets/games/catane/sound/" + sound + ".wav";

   // switch (sound) {
   //    case "deep-whoosh":
   //       audio.playbackRate = .9;
   //       audio.volume = 0.15;
   //       break;
   //    case "dice":
   //       var randomNumber = Math.floor(Math.random() * 4) + 1;
   //       audio.src = "/medias/assets/games/catane/sound/" + sound + randomNumber + ".wav";
   //       console.log(randomNumber)

   //       if (randomNumber == 1) {
   //          audio.playbackRate = 0.7;
   //       }
   //       else if (randomNumber == 2) {
   //          audio.playbackRate = 0.5;
   //       }
   //       else if (randomNumber == 3) {
   //          audio.playbackRate = 0.6;
   //       }
   //       else if (randomNumber == 4) {
   //          audio.playbackRate = 0.9;
   //       }
   //       else {
   //          audio.playbackRate = 1;
   //       }
   //       audio.volume = 1;
   //       break;
   //    case "btn5":
   //       audio.volume = 0.5;
   //       break;
   //    default:
   //       audio.playbackRate = 1;
   //       audio.volume = 1;
   // }
}