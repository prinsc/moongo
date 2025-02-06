import * as main from './index.js';
import * as gameUtils from './game-utils-functions.js';
import * as gameMap from './game-map.js';


let i;
let letsplay = true;

const woodCard = `<div class="col"><div class="card c-wood"><img class="ico-large" src="/medias/assets/games/catane/ressources/wood.svg" /><span>Bois</span></div></div>`;
const clayCard = `<div class="col"><div class="card c-clay"><img class="ico-large" src="/medias/assets/games/catane/ressources/clay.svg" /><span>Argile</span></div></div>`;
const wheatCard = `<div class="col"><div class="card c-wheat"><img class="ico-large" src="/medias/assets/games/catane/ressources/wheat.svg" /><span>Blé</span></div></div>`;
const sheepCard = `<div class="col"><div class="card c-sheep"><img class="ico-large" src="/medias/assets/games/catane/ressources/sheep.svg" /><span>Mouton</span></div></div>`;
const stoneCard = `<div class="col"><div class="card c-stone"><img class="ico-large" src="/medias/assets/games/catane/ressources/stone.svg" /><span>Pierre</span></div></div>`;

/**
 * Il prend un tableau de tableaux, et pour chaque tableau, il crée une ligne dans une table.
 * @param data - []
 */
export function showRooms(data) {
   gameUtils.showElement(main.roomList, 0);

   $('.room_list > .row.list').remove();
   if (data.length > 0) {

      // il a des rooms 
      let html = "";

      data.forEach(room => {

         var status = "";
         var idOfRoom = room[0];
         var nameOfHost = room[1];
         var nbJou = room[2];
         var maxP = room[3];
         var gameStart = room[4];
         var pass = room[5];

         if (gameStart) {
            status = "Partie en cours";
         }
         else if (nbJou >= maxP) {
            status = "Partie remplie";
         }
         else {
            status = "En attente de joueurs...";
         }

         html += "<div class='row list' id='r-" + idOfRoom + "'>"
         html += "<div class='col room'>";
         html += `<span>#${idOfRoom}</span > `;
         html += "</div>";
         html += "<div class='col host'>";
         html += `<span>${nameOfHost}</span > `;
         html += "</div>";
         html += "<div class='col nbjou'>";
         html += `<span><span id="nb_joueur">${nbJou}</span> / <span id="max_joueur">${maxP}</span></span > `;
         html += "</div>";
         html += "<div class='col status'>";
         html += `<span>${status}</span > `;
         html += "</div>";
         html += "<div class='col actions'>";

         if (gameStart) html += `<button class="join" data-room="${idOfRoom}">Partie en cours</button > `;
         else if (nbJou >= maxP) html += `<button class="join" data-room="${idOfRoom}">Full</button > `;
         else html += `<button class="join" data-room="${idOfRoom}">Rejoindre</button > `;

         html += "</div>";
         html += "<div class='col pass'>";

         if (!gameStart) {
            if (pass) {
               html += `<input class="discret" type="password" placeholder="Clé" id="passRoom_${idOfRoom}" maxlength="16" autocomplete autocorrect="off" autocapitalize="off" spellcheck="false" value="" autofocus name="passRoom"></input > `;
            }
            else {
               html += `<span>Accès libre</span > `;
            }
         }
         html += "</div>";
         html += "</div>";
      });

      $(main.roomList).append(html);
   }
   else {
      gameUtils.hideElement(main.roomList, 0);
      $('.room_list > .list').remove();
   }
}

/**
 * Il prend une chaîne et un tableau comme paramètres, et il change le CSS de certains éléments
 * @param status - "tout va bien"
 * @param map - [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
 * @returns une valeur booléenne.
 */
export function startRoom(status, map) {
   if (status == "allOk") {

      // map creation
      for (i = 0; i < 19; i++) {
         if (i === 9) {
            continue;
         }
         $("div.hexa#pl-" + i).addClass(map[i]);
      }

      gameUtils.playInterval();

      gameUtils.hideElement(main.mainStart, 0);
      gameUtils.hideElement(main.roomWaiting, 0);
      gameUtils.showElement(main.mainGame, 0);

      $('#mynick').html(main.player.username);

      // supprimer les enfants de chaque coord
      $('.interactif > .row > .col > span').children().remove();

      return true;
   }
   else {
      gameUtils.playSound("btn5");
      gameUtils.bringButton($("#start"));
      console.log("Error : " + status);
      return false;
   }
}

/**
 * C'est une fonction qui est appelée lorsqu'un joueur rejoint une salle.
 * @param idOfRoom - l'identifiant de la chambre
 * @param status - le statut de la chambre (allOk, key, start, limit, info)
 * @param isHost - true si le joueur est l'hôte de la salle
 * @param player - l'objet joueur
 * @param nbP - nombre de joueurs dans la salle
 * @returns une valeur booléenne.
 */
export function joinRoom(idOfRoom, status, isHost, player, nbP) {
   if (status == "allOk") {
      // connect to room
      gameMap.make();
      $('#room_id_content').html("#" + idOfRoom);
      gameUtils.showElement($('#room_id'), 0);

      if (isHost) gameUtils.showElement($(".settings"));
      gameUtils.hideElement(main.gameActions, 0);
      gameUtils.hideElement(main.roomList, 0);
      gameUtils.showElement(main.roomWaiting, 0);

      main.player.roomId = idOfRoom;
      main.player.order = nbP;

      return true;
   }
   else if (status == "key") {
      console.log("wrong pass for " + idOfRoom);
      gameUtils.bringButton($('#passRoom_' + player.roomId));
      return false;
   }
   else if (status == "start") {
      console.log("game already started");
      gameUtils.bringButton($('.room_list .row#r-' + idOfRoom + ' .join'));
      return false;
   }
   else if (status == "limit") {
      console.log("limit of players ");
      gameUtils.bringButton($('.room_list .row#r-' + idOfRoom + ' .join'));
      return false;
   }
   else if (status == "info") {
      console.log("Error informations not avaible " + status);
      return false;
   }
   else {
      console.log("Error : " + status);
      return false;
   }
}

/**
 * Il met à jour l'interface utilisateur du jeu
 * @param data
 */
export function updateRoom(data) {
   // update menu players

   $("#player_list > li").remove();
   // update scoreboard
   data.players.forEach((p) => {
      let total = p.resources.wheat +
         p.resources.sheep +
         p.resources.clay +
         p.resources.stone +
         p.resources.wood;
      gameUtils.replaceContent($('.scoreboard > .j-' + p.order + ' > .points > span'), p.point);
      // gameUtils.replaceContent($('.scoreboard > .j-' + p.order + ' > .dev_cards > span'), p.dCards.length);
      gameUtils.replaceContent($('.scoreboard > .j-' + p.order + ' > .resource_cards > span'), total);
      // update menu players

      if (main.player.order != p.order) $('#player_list').append(`<li data-porder="${p.order}">${p.username}</li>`);

   });
   $('#player_list').append(`<li data-porder="4" class="select">Tout le monde</li>`);

   // si on vient de commencer la phase trois
   if (data.phase == 2 && letsplay) {
      // creation scoreboard
      letsplay = false;

      gameUtils.showElement($(".score > span"), 0);
      data.players.forEach((player) => {
         $(".scoreboard").append("<div class='row j-" + player.order + "'></div>");
         let txt = `  <div class="col medal"><span>🏅</span></div>
            <div class="col pseudo"><span>${player.username}</span></div>
            <div class="col points"><span>0</span></div>
            <div class="col dev_cards"><span>0</span></div>
            <div class="col resource_cards"><span>0</span></div>`;
         $(".scoreboard > .row.j-" + player.order).html(txt);
      });
      gameUtils.showElement($(".scoreboard"), 0);
   }

   gameUtils.replaceContent(main.phase, data.phase);
   gameUtils.replaceContent(main.tourCount, data.tourCount);
   gameUtils.replaceContent($('#devCards_quant'), data.devCardsQuant);

   switch (data.phase) {
      case 1:
         gameUtils.replaceContent($('.phase-ctn > p'), "Chaque joueur doit lancer les dés pour déterminer dans quel ordre le jeux se déroulera. (si deux joueurs font le même résultat, c'est le premier à avoir rejoint la partie qui prendre position)");
         break;
      case 2:
         gameUtils.replaceContent($('.phase-ctn > p'), "Le joueur ayant effectué le plus haut score durant la phase 1, place une première colonie et une route à côté, tous les joueurs en font de même suivant leur résultat aux dés. Un colonie est placée à l'intersection de 3 tuiles. <br>Le joueur ayant fait le plus mauvais score pose directement ses deux colonies et on remonte ensuite jusqu'au premier joueur. <br>Le premier joueur aura donc emplacement qu'il veut pour sa première colonie mais devra prendre ce qui reste lors de la pose de sa seconde colonie.");
         break;
      case 3:
         gameUtils.replaceContent($('.phase-ctn > p'), "Les points ont été placé et les ressources ont été données aux joueurs. Il est maintenant temps de jouer !");
         break;
      default:
         gameUtils.replaceContent($('.phase-ctn > p'), "??");
         break;
   };

   // actualisation du tour
   if (main.player.order === data.whoPlay) {
      if ($("#switch-automatic-play").is(':checked') && data.phase !== 2 && $('span#personnel-message').hasClass('d-none')) {
         setTimeout(() => {
            $('#roll-dice').click();
         }, 250);
      }
      gameUtils.showElement($('span#personnel-message'));
   }
   else {
      gameUtils.hideElement($('span#personnel-message'));
   }
   // afficher les ressources dispo
   data.players.forEach((p) => {
      if (p.order === main.player.order) {

         // mise à jour des batiments
         gameUtils.replaceContent($('#my_roads'), p.buildings.roads)
         gameUtils.replaceContent($('#my_settlements'), p.buildings.settlements);
         gameUtils.replaceContent($('#my_cities'), p.buildings.cities);

         let total = p.resources.wheat +
            p.resources.sheep +
            p.resources.clay +
            p.resources.stone +
            p.resources.wood;

         // mise à jour des resources
         gameUtils.replaceContent($('#my_wood'), p.resources.wood)
         gameUtils.replaceContent($('#my_stone'), p.resources.stone);
         gameUtils.replaceContent($('#my_clay'), p.resources.clay);
         gameUtils.replaceContent($('#my_sheep'), p.resources.sheep);
         gameUtils.replaceContent($('#my_wheat'), p.resources.wheat);

         gameUtils.replaceContent($('#my_total_resources'), total);

         let html = "";

         for (i = 0; i < p.resources.wood; i++) {
            html += woodCard;
         }
         for (i = 0; i < p.resources.clay; i++) {
            html += clayCard;
         }
         for (i = 0; i < p.resources.sheep; i++) {
            html += sheepCard;
         }
         for (i = 0; i < p.resources.wheat; i++) {
            html += wheatCard;
         }
         for (i = 0; i < p.resources.stone; i++) {
            html += stoneCard;
         }

         // html.append(woodCard);
         $('.ressources > .row').html(html);

      }
   });
}


/**
 * Il met à jour les informations de la salle (nombre de joueurs, joueurs max, liste des joueurs, etc.)
 * @param data - [gameBegin, nbJou, maxPlayer, joueurs, isHost, roomId]
 */
export function updateRoomInfo(data) {
   if (data[5] === main.player.roomId) {
      // const gameBegin = data[0];
      const nbJou = data[1];
      const maxPlayer = data[2];
      const players = data[3];

      var text = `${nbJou} / ${maxPlayer} joueur`;
      if (nbJou > 1) text += "s";
      $('#nbJoueur').html(text);

      if (players.length == 1) {
         $('#listJoueurs').html("En attente de joueurs...");
      }
      else {
         let html = "";
         for (i = 0; i < players.length; i++) {
            if (i == 0) {
               html += `<li >👑 ${players[i]}</li > `;
            }
            else {
               if (i == players.length - 1) {
                  html += `<li class="d-none" >👋 ${players[i]}</li > `;
               }
               else {
                  html += `<li >👋 ${players[i]}</li > `;
               }
            }
         }
         $('#listJoueurs').html(html);
         gameUtils.showElement($("li.d-none"), 0);
      }
      if (data[4]) {
         main.roomWaiting.append("<button id='start' class='d-none'>Démarrer la partie</button>");
         // ! à changer en > au lieu de >=
         if (players.length >= 1) {
            gameUtils.showElement($("#start"));
         }
      }

   }
}

/**
 * Il réinitialise le jeu et affiche le menu principal
 */
export function disconnect() {
   main.player.roomId = "";

   gameUtils.stopInterval();
   gameUtils.resetInterval();

   gameUtils.showElement(mainStart, 800);
   gameUtils.showElement(gameActions, 800);
   gameUtils.hideElement(mainGame, 0);
   gameUtils.hideElement(roomWaiting, 0);
}