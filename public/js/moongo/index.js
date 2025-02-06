// moongo client side
$(function () {

   debugger

   var name = getPseudo();
   var mm = "0";
   var ss = "0";
   var gamestart = false;

   const player = {
      roomId: "",
      username: "",
      socketId: ""
   }

   const socket = io("/games/moongo");

   var pseudo = $('#pseudo');
   var tourCount = $("#tour_count");
   var consoleContent = $(".text");
   var roomId = $("#room_id_content");

   var mainSalon = $('.main_salon');
   var mainRoomList = $(".main_room_list");
   var mainSalonWaiting = $('.salon_waiting');

   if (name) pseudo.val(name);
   $('.background').css("opacity", "1");

   socket.on('start game', (nbPlayers, username, order, nbTour) => {

      nbjou = nbPlayers;
      tourCount.html("Tour " + nbTour);

      startGame();

      consoleContent.empty();
      $(".players").empty();

      if (nbTour === 0) {
         resetInterval();
         playInterval();
      }

      if (nbPlayers >= 7) $('.background').css("display", "none");

      if (pseudo.val() == "Zefira") {
         $('.game').append('<div class="TEMPORARY"><button id="leave">Abandonner<br>(comme une lâche)</button></div>')
      }

      for (i = 0; i < nbPlayers; i++) {

         var tempTxt = `<div class='stopEvent player j-${i}'>
                           <span>
                              ${username[i]}<span>0 point</span>
                           </span>
                        <div class='other cards'>`;

         for (y = 0; y < 12; y++) tempTxt = tempTxt + `<div data-pos='${y}' class='card nvi' id='${i}${y}'><span></span></div>`;

         tempTxt = tempTxt + "</div>";

         $(".players").append(tempTxt);

         if (!gamestart) {
            $(".scoreboard > .score").append("<div class='row j-" + i + "'>");

            txt = `<div class="col medal">
                  <span></span>
               </div>
               <div class="col pseudo">
                  <span>${username[i]}</span>
               </div>
               <div class="col points">
                  <span>0</span>
               </div></div>`;
            $(".scoreboard > .score > .row.j-" + i).html(txt);

            $(".scoreboard > .score > .row").addClass("smooth-show-text");
            $(".scoreboard > .score > .row.j-" + i + ".smooth-show-text").css("animation-delay", i * 500 + "ms");
         }
      }

      gamestart = true;

      mooveFocus(0);

      $(".j-" + order).removeClass("stopEvent");

      $(".discard > .cards > div").addClass("stopEvent");
      $(".discard > .cards > div").css("opacity", 0);
   });

   socket.on('update game', (roomId, gameSize, discardSize, lastTour) => {
      if (player.roomId === roomId) {
         $('#nbr_cartes').html(gameSize);
         $('#nbr_cartes_discard').html(discardSize);
         $(".discard > .cards > div > span").html(discardSize[0]);
         $(".j-" + lastTour + " > div").removeClass("other");
         roomId.html("#" + roomId);
      }
   });

   // SERVER REP - JOIN ROOM
   socket.on('join room', (new_roomId) => {
      player.roomId = new_roomId;
      roomId.html("#" + new_roomId);
      roomId.addClass("animate__animated animate__fadeIn");
   });

   // SERVER REP - RETOURNER CARTE
   socket.on('retourner carte', (nujou, card, val, points) => {
      $('div#' + nujou + card).removeClass("nvi");
      $('div#' + nujou + card + ' > span').html(val)
      $('div#' + nujou + card).addClass("stopEvent");

      updatePoints(nujou, points);
      updateCardStyle();
   });

   // SERVER REP - REPLACE CARD
   socket.on('replace card', (nujou, card, newVal, oldVal, points) => {
      replaceCard(nujou, card, newVal, oldVal, points);
   });

   // SERVER REP - NEXT TURN
   socket.on('tour suivant', (whoPlay) => {
      $(".cards").addClass("other");
      $(".j-" + whoPlay + " > .cards").removeClass("other");
      $(".cards > .draw").removeClass("stopEvent");
      mooveFocus(whoPlay);
   });

   // SERVER REP - GAME BEGIN
   socket.on('game begin', () => {
      $(".player > div.cards > div").removeClass("stopEvent");
   });

   // SERVER REP - PLAY SOUND
   socket.on('play sound', (sound) => {
      const audio = new Audio("/medias/sound/" + sound + ".wav");
      audio.volume = 0.5;
      audio.play();

      if (sound == "win-game" || sound == "loose" || sound == "message-receive") notif();
   });

   // SERVER REP - draw
   socket.on('draw', (valeur) => {

      animation = 800;

      $(".main_cards > .cards > div.draw").clone().appendTo(".main_cards > .cards").addClass("temp");
      $(".main_cards > .cards > div.draw").addClass("stopEvent");

      setTimeout(function () {
         $(".main_cards > .cards > div.draw.temp").css("transform", "translateX(180px) rotateY(180deg)");
      }, 15);

      setTimeout(function () {

         $(".main_cards > .cards > div.draw.temp > span").html(valeur);
         $(".main_cards > .cards > div.draw.temp > span").css("opacity", "1");
         $(".main_cards > .cards > div.draw.temp > span").css("transform", "translateX(0) rotateY(180deg)");
         updateCardStyle();

      }, animation / 2);

      setTimeout(function () {

         $(".discard > .cards > div > span").html(valeur);

         setTimeout(function () {

            $(".discard > .cards > div").removeClass("stopEvent");
            $(".discard > .cards > div").css("opacity", 1);

            setTimeout(function () {
               $(".main_cards > .cards > div.draw.temp").remove();
            }, 100);

            adddiscard(1);
            retirerJeux();

         }, animation / 10);

         updateCardStyle();

      }, animation);

      updateCardStyle();
   });

   // SERVER REP - SHOW ROOMS
   socket.on('update room', (nbRooms, receive) => {
      showRoomContentList(nbRooms, receive);
   });

   // SERVER REP - LAST CARD
   socket.on('last card', () => {
      $(":root").css({ "--primary-color": "#ff7373" });
   });

   // SERVER REP - UPDATE ROOM CONTENT
   socket.on('update room players', (receive) => {
      showRoomPlayerList(receive);
   });

   // SERVER REP - LEAVE ROOM
   socket.on('leave room', () => {
      if (player.roomId != "") {
         leaveRoom();
      }
   });

   // SERVER REP - REMOVE COL
   socket.on('remove col', (position, nujou, lastCardVal, nbcol) => {

      // on récup le nb de col
      var nb_col = $(".j-" + nujou + " > .cards").css("grid-template-columns");

      // on ajoute à la defausse
      adddiscard(3);

      // on retourne la carte
      $(".discard > .cards > div > span").html(lastCardVal);

      $('div#' + nujou + position).removeClass("nvi");
      $('div#' + nujou + position + ' > span').html(lastCardVal);
      $('.j-' + nujou + ' > div.cards > div.card').addClass("stopEvent");

      setTimeout(() => {
         $('div.card#' + nujou + card + " > span").html(lastCardVal);
         updateCardStyle();
      }, 550);


      $(".j-" + nujou + " > .cards > div.card").addClass("transition-col-remove");

      discardTop = $('.discard > .cards > .card').offset().top;
      discardLeft = $('.discard > .cards > .card').offset().left;

      // on glisse tout vers le haut
      setTimeout(() => {
         if (position < 4) {
            $(".j-" + nujou + " > .cards > div.card#" + nujou + position).css("transform", "translateY(0px)").addClass('toRemove');
            $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position + 4)).css("transform", "translateY(-73px)").addClass('toRemove');
            $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position + 8)).css("transform", "translateY(-146px)").addClass('toRemove');

            playerCardPosTop = $('div.card#' + nujou + position).offset().top;
            playerCardPosLeft = $('div.card#' + nujou + position).offset().left;
         }

         else if (position < 8) {
            $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position - 4)).css("transform", "translateY(0px)").addClass('toRemove');
            $(".j-" + nujou + " > .cards > div.card#" + nujou + position).css("transform", "translateY(-73px)").addClass('toRemove');
            $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position + 4)).css("transform", "translateY(-146px)").addClass('toRemove');

            playerCardPosTop = $('div.card#' + nujou + parseInt(position - 4)).offset().top;
            playerCardPosLeft = $('div.card#' + nujou + parseInt(position - 4)).offset().left;
         }

         else {
            $(".j-" + nujou + " > .cards > div.card#" + nujou + position).css("transform", "translateY(-146px)").addClass('toRemove');
            $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position - 4)).css("transform", "translateY(-73px)").addClass('toRemove');
            $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position - 8)).css("transform", "translateY(0px)").addClass('toRemove');

            playerCardPosTop = $('div.card#' + nujou + parseInt(position - 8)).offset().top;
            playerCardPosLeft = $('div.card#' + nujou + parseInt(position - 8)).offset().left;
         }

         // on supprime tous les éléments sauf le premier 
         setTimeout(() => {
            $(".j-" + nujou + " > .cards > div.card").removeClass("transition-col-remove");

            $('div.card#' + nujou + position).clone().appendTo(".game").addClass("animate_pcards").removeAttr('id style');
            updateCardStyle();

            $(".animate_pcards").css({
               "opacity": 1,
               "top": playerCardPosTop,
               "left": playerCardPosLeft
            });

            $(".j-" + nujou + " > .cards > div.card#" + nujou + position).css("opacity", "0");

            if (position < 4) {
               $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position + 4)).css("opacity", "0");
               $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position + 8)).css("opacity", "0");
            }
            else if (position < 8) {
               $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position - 4)).css("opacity", "0");
               $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position + 4)).css("opacity", "0");
            }
            else {
               $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position - 4)).css("opacity", "0");
               $(".j-" + nujou + " > .cards > div.card#" + nujou + parseInt(position - 8)).css("opacity", "0");
            }

            $(".animate_pcards").animate({
               top: discardTop,
               left: discardLeft,
               width: "120px",
               height: "200px",
               "font-size": "45px"
            }, 500, 'easeInOutQuad');

            setTimeout(() => {
               $(".game > div.animate_pcards").remove();
               $('.toRemove').css("display", "none");
               $(".j-" + nujou + " > .cards").css("grid-template-columns", "repeat(" + (nbcol - 1) + ", 50px)");
               $('.j-' + nujou + ' > div.cards > div.card').removeClass('stopEvent');
            }, 550);

         }, 400);

      }, 400);

      updateCardStyle();

   });


   socket.on('game end', (players, finish, nbTour) => {

      pointG = [];

      tourCount.html("Tour " + nbTour);

      for (i = 0; i < players.length; i++) {

         who = 0;

         for (y = 0; y < 12; y++) {
            $(".j-" + i + " > .cards > div#" + (i) + y).removeClass("nvi");
            $(".j-" + i + " > .cards > div#" + (i) + y + " > span").html(players[i].cartes[y]);
            $(".j-" + i + " > .cards > div#" + (i) + y).addClass("stopEvent");
         }

         who = [];
         who.push(players[i].username);
         who.push(players[i].pointGlobal);
         pointG.push(who);
      }

      pointG = pointG.sort(function (a, b) {

         if (a[1] === b[1]) {
            return 0;
         } else {
            return (a[1] < b[1]) ? -1 : 1;
         }
      });

      $(".scoreboard > .score").empty();
      $(".scoreboard > button").remove();

      for (i = 0; i < players.length; i++) {
         $(".scoreboard > .score").append("<div class='row j-" + i + "'>");

         switch (i) {
            case 0:
               medal = "<i class='ico pr-medals-1st s-64'></i>";
               break;
            case 1:
               medal = "<i class='ico pr-medals-2nd s-64'></i>";
               break;
            case 2:
               medal = "<i class='ico pr-medals-3nd s-64'></i>";
               break;
            default:
               medal = "";
         }

         if (i == (players.length - 1)) medal = "<i class='ico pr-poop s-64'></i>";

         txt = `<div class="col medal">
                  <span>${medal}</span>
               </div>
               <div class="col pseudo">
                  <span>${pointG[i][0]}</span>
               </div>
               <div class="col points">
                  <span>${pointG[i][1]}</span>
               </div></div>`;
         $(".scoreboard > .score > .row.j-" + i).html(txt);

         $(".scoreboard > .score > .row").addClass("smooth-show-text");
         $(".scoreboard > .score > .row.j-" + i + ".smooth-show-text").css("animation-delay", i * 500 + "ms");
         updatePoints(i, players[i].points);

      }
      if (!finish) {
         for (i = 0; i < players.length; i++) {

            if (players[i].host && players[i].socketId === socket.id) {
               $(".scoreboard").append(`<button id="replay" class="animate__animated animate__fadeInUp">Manche suivante</button>`);
            }
         }
      } else {
         stopInterval();
         for (i = 0; i < players.length; i++) {

            if (players[i].host && players[i].socketId === socket.id) {
               $(".scoreboard").append(`<button id="home" class="animate__animated animate__fadeInUp">Quitter</button>`);
            }
         }
      }

      updateCardStyle();
      notif();
      $(":root").css({ "--primary-color": "var(--color-beige)" });

   });

   socket.on('update points', (nujou, points) => {
      updatePoints(nujou, points);
   });

   /**
    * ==========================
    *  ! Event CLICK !
    * ==========================
    */

   // JOIN ROOM
   $(document).on('click', '#join', function () {

      idOfRoom = $(this).data("room");

      if (pseudo.val() != "") {

         player.username = pseudo.val();
         player.socketId = socket.id;
         player.roomId = idOfRoom;

         localStorage.setItem("pseudo", player.username);

         socket.emit('join room', player);

         $('.main_view > h1').removeClass().css("margin-top", "-100px");
         mainSalonWaiting.removeClass("d-none").addClass("animate__animated animate__zoomIn");
         mainSalon.addClass("d-none");
         mainRoomList.addClass("d-none");

         roomId.html("#" + idOfRoom);
         $("#room_id").addClass("animate__animated animate__fadeIn");

      } else {
         bringButton('input#pseudo');
      }
   });

   // CREATE ROOM
   $(document).on('click', '#createRoom', function () {
      if (pseudo.val() != "") {

         $(this).attr("disabled", true);

         player.roomId = "";
         player.username = pseudo.val();
         player.socketId = socket.id;

         localStorage.setItem("pseudo", player.username);

         mainSalonWaiting.removeClass("d-none").addClass("animate__animated animate__fadeInUp");
         mainSalon.addClass("animate__animated animate__zoomOut");

         $('#nbJoueur').empty().append("1 / 8 joueur");
         mainSalonWaiting.remove("button").append("<button id='start'>Démarrer la partie</button>").addClass("smooth-show-text");
         mainRoomList.remove();

         $('.list_joueurs').empty();
         $('.main_view > h1').removeClass().css("margin-top", "-100px");
         $('.list_joueurs').append("<li><i>En attente de joueurs...</i></li>").addClass("smooth-show-text");

         socket.emit('create room', player);
      } else {
         bringButton('input#pseudo');
      }
   });

   // START ROOM
   $(document).on('click', '#start', function () {
      socket.emit('get rooms');
      $("#createRoom").attr("disabled", false);

      socket.on('show rooms', (roomId, psocket, nbJou) => {

         if (player.socketId === psocket && roomId === player.roomId) {

            if (nbJou >= 1 && nbJou <= 8) { // !! à changer

               startGame();

               $(".scoreboard > .score").empty();
               $(".salon_waiting > button").remove();

               socket.emit('start game', player);


            } else {
               bringButton('button#start');
            }
         }

      });
   });

   // CLICK CARD
   $(document).on('click', '.players > div.player > div.cards > div', function () {
      position = $(this).data("pos");
      socket.emit('click card', player, position);
   });

   // CLICK draw
   $(document).on('click', 'div.main_cards > div.cards > div.draw', function () {
      socket.emit('click draw', player);
   });

   // CLICK draw
   $(document).on('click', '#draw', function () {
      socket.emit('click draw', player);
   });

   // CLICK NEXT
   $(document).on('click', '#next', function () {
      socket.emit('next', player);
   });

   // CLICK REPLAY
   $(document).on('click', '#replay', function () {
      $("#replay").addClass("animate__animated animate__fadeOutDown");
      if ($('.context-menu').hasClass('open-menu')) {
         menu();
      }
      socket.emit('replay', player);
   });

   // CLICK HOME
   $(document).on('click', '#home', function () {
      socket.emit('remove room', player);
   });

   // SEND MESSAGE
   function sendMessage(message) {
      if (message.val() !== "") {
         socket.emit('message', message.val());
         message.val("");
      }
   }

   $(document).on('click', '#sendMessage', function () {
      sendMessage($('#message'));
   });

   $(document).on('click', '#leave', function () {
      leaveRoom();
   });

   $(document).on('click', '#menu', function () {
      menu();
   });

   $('#message').keyup(function (e) {
      if (e.keyCode == 13) {
         sendMessage($('#message'));
      }
   });
   /**
    * ==========================
    *  ! Functions !
    * ==========================
    */
   function replaceCard(nujou, card, newVal, oldVal, points) {

      $('div.card#' + nujou + card).removeClass("stopEvent");
      $(".discard > .cards > div.card").removeClass("stopEvent");
      if ($("#nbr_cartes_discard").html() > 1) {
         $(".discard > .cards > div.card").clone().removeAttr("style").appendTo(".game").addClass("other_discard");
         $(".other_discard > span").remove();
         $(".other_discard").css({
            "top": $(".discard > .cards > div.card").offset().top,
            "left": $(".discard > .cards > div.card").offset().left
         });
      }


      $(".discard > .cards > div.card").clone().appendTo(".game").addClass("animate_discard");
      $(".discard > .cards > div.card").css("opacity", 0);
      $(".animate_discard").css({
         "top": $(".discard > .cards > div.card").offset().top,
         "left": $(".discard > .cards > div.card").offset().left,
         "font-size": "18px"
      });


      $('div.card#' + nujou + card).clone().appendTo(".game").addClass("animate_pcards");
      $('div.card#' + nujou + card).css("opacity", 0);
      $(".animate_pcards").css({
         "top": $('div.card#' + nujou + card).offset().top,
         "left": $('div.card#' + nujou + card).offset().left,
         "font-size": "45px"
      });
      $(".discard > .cards > div.card > span").html(oldVal);

      playerCardPosTop = $('div.card#' + nujou + card).offset().top;
      playerCardPosLeft = $('div.card#' + nujou + card).offset().left;

      discardTop = $('.discard > .cards > .card').offset().top;
      discardLeft = $('.discard > .cards > .card').offset().left;

      $(".discard > .cards > div.card").css("transition", "none");
      $('div#' + nujou + card).css("transition", "none");

      $(".animate_discard").animate({
         top: playerCardPosTop,
         left: playerCardPosLeft,
         width: "38px",
         height: "62px"
      }, 500, 'easeInOutQuad');

      $(".animate_pcards").animate({
         top: discardTop,
         left: discardLeft,
         width: "120px",
         height: "200px"
      }, 500, 'easeInOutQuad');

      if ($('div#' + nujou + card).hasClass("nvi")) {

         $('div#' + nujou + card).removeClass("nvi");
         $(".animate_pcards").css({
            "transform": "rotateY(180deg)",
            "transition": "transform ease-in-out .5s"
         });
         $(".animate_pcards > span").css({
            "transform": "rotateY(180deg)"
         });
         setTimeout(() => {
            $(".animate_pcards > span").html(oldVal);
            updateCardStyle();
         }, 250);
         setTimeout(() => {
            $(".game > div.animate_discard").remove();
            $(".game > div.animate_pcards").remove();
            $('div#' + nujou + card + " > span").html(newVal);

            $(".discard > .cards > div.card").css("opacity", 1);
            $('div#' + nujou + card).css("opacity", 1);

            $(".other_discard").remove();

            updateCardStyle();
         }, 550);
      } else {
         setTimeout(() => {
            $(".game > div.animate_discard").remove();
            $(".game > div.animate_pcards").remove();
            $('div#' + nujou + card + " > span").html(newVal);

            $(".discard > .cards > div.card").css("opacity", 1);
            $('div#' + nujou + card).css("opacity", 1);

            $(".other_discard").remove();

            updateCardStyle();
         }, 550);
      }

      updateCardStyle();
      updatePoints(nujou, points);
   }
   function notif() {
      if (!$('.context-menu').hasClass('open-menu')) {
         $('.notif').addClass('wobble-notif');
         setTimeout(() => {
            $('.notif').removeClass('wobble-notif');
         }, 3000);
      }
   }
   function menu() {
      if (!$(".context-menu").hasClass("open-menu")) {
         // open menu
         $(".context-menu").addClass("open-menu");
         $('.context-menu').css("pointer-events", "all");
         $('.players, #_card_games').css({
            'opacity': '.1',
            'pointer-events': 'none'
         });
         $(".console").addClass("open-menu animate__animated animate__fadeInDown");
         $(".scoreboard").addClass("open-menu animate__animated animate__fadeInUp");
         return false;
      }
      else {
         // close menu
         $(".context-menu").removeClass().addClass("context-menu");
         $('.context-menu').css("pointer-events", "none");
         $('.players, #_card_games').css({
            'opacity': '1',
            'pointer-events': 'all'
         });
         $(".console").addClass("animate__animated animate__fadeOutUp");
         $(".scoreboard").addClass("animate__animated animate__fadeOutDown");
         setTimeout(function () {
            $('.context-menu').css("pointer-events", "all");
            $(".console").removeClass().addClass("console");
            $(".scoreboard").removeClass().addClass("scoreboard");
         }, 800);
         return true;
      }
   }
   function showRoomContentList(nbRoom, receive) {
      let html = "";
      if (nbRoom > 0) {

         if (mainSalonWaiting.hasClass("d-none")) mainRoomList.removeClass("d-none");

         for (i = 0; i < nbRoom; i++) {
            if (receive[i][0] >= 8) {
               html += `<div class='row animate__animated animate__fadeInUp animate__slow'>
                        <div class='col'>
                          <span><b>FULL /8</b> - Salon de <b>${receive[i][2]}</b> - ${receive[i][3]} </span>
                        </div>
                        <div class='col'>
                          <button class="game-full">Rejoindre</button>
                        </div>
                      </div>`;
            } else if (receive[i][1]) {
               html += `<div class='row animate__animated animate__fadeInUp animate__slow'>
                  <div class='col'>
                    <span><b>${receive[i][0]}/8</b> - Salon de <b>${receive[i][2]}</b> - #${receive[i][3]}</span>
                  </div>
                  <div class='col'>
                  <button class="game-full">Partie en cours</button>
                  </div>
                </div>`;
            } else {
               html += `<div class='row animate__animated animate__fadeInUp animate__slow'>
                       <div class='col'>
                         <span><b>${receive[i][0]}/8</b> - Salon de <b>${receive[i][2]}</b> - ${receive[i][3]} </span>
                       </div>
                       <div class='col'>
                         <button id="join" data-room="${receive[i][3]}">Rejoindre</button>
                       </div>
                     </div>`;
            }
         }
      }
      if (html !== "") {
         mainRoomList.empty().append(html);
      }
      if (nbRoom == 0) {
         // pas de room 
         mainRoomList.addClass("d-none");
         mainRoomList.empty();
      }
   }

   function showRoomPlayerList(receive) {
      nbJou = 0;
      for (i = 0; i < receive.length; i++) {

         room_id = receive[i][0];
         phost = receive[i][1];
         pusername = receive[i][2];

         // si le joueur est dans la roomId
         if (player.roomId == room_id) {

            nbJou++;
            initial = -100;
            initial = -25 + initial;

            $('.main_view > h1').css({
               "margin-top": initial
            });
            $('#nbJoueur').empty().append(nbJou + " / 8 joueurs");

            if (phost) {
               $('#nbJoueur').empty().append(nbJou + " / 8 joueurs");
               $('.list_joueurs').empty();
               $('.list_joueurs').append("<li> <b>" + pusername + "</b> a créé la partie 👑</li>");
            } else {
               if (nbJou == receive.length) {
                  $('.list_joueurs').append("<li class='animate__animated animate__fadeInUp'><b>" + pusername + "</b> nous a rejoint ! 💜</li>");
               } else {
                  $('.list_joueurs').append("<li><b>" + pusername + "</b> nous a rejoint ! 💜</li>");
               }
            }
         }
      }
   }
   function leaveRoom() {
      mainSalon.removeClass().addClass('main_salon content');
      mainSalonWaiting.removeClass().addClass('salon_waiting d-none');
      mainRoomList.removeClass().addClass('main_room_list content');
      $('.main_view').removeClass().addClass("main_view animate__animated animate__zoomIn");
      $('.game').removeClass().addClass("game d-none");

      $('.main_view > h1').removeAttr('style');

      $('.main_view > .scoreboard').remove();

      $(".scoreboard > .score").empty();
      roomId.empty();
      tourCount.empty();
      $("#timer").empty();

      $('.background').css("opacity", "1");

      resetInterval();
      stopInterval();
   }

   function startGame() {
      $('#home').remove();
      mainSalon.addClass('d-none');
      mainSalonWaiting.addClass('d-none');
      mainRoomList.addClass('d-none');
      $('.main_view').addClass("animate__animated animate__zoomOut");
      $('.game').removeClass().addClass("game animate__animated animate__zoomIn");
   }

   function bringButton(btn) {
      $(btn).addClass("wobble-hor-bottom");
      setTimeout(function () {
         $(btn).removeClass("wobble-hor-bottom");
      }, 800);
   }

   function adddiscard(nb) {
      total = $('#nbr_cartes_discard').html();
      $('#nbr_cartes_discard').empty().html(parseInt(total) + nb);
   }

   function retirerJeux() {
      total = $('#nbr_cartes').html();
      $('#nbr_cartes').empty().html(parseInt(total) - 1);
   }

   function updateCardStyle() {
      $("div.card > span").each(function () {
         if ($(this).html() != "-4") {
            $(this).parent().removeClass("shine");
         }
         // switch ($(this).html()) {
         //    case '-4':
         //       $(this).parent().css("background", "MediumSlateBlue");
         //       $(this).parent().addClass("shine");
         // }
         // switch ($(this).html()) {
         //    case '-2':
         //    case '-1':
         //       $(this).parent().css("background", "DodgerBlue");
         // }
         // switch ($(this).html()) {
         //    case '0':
         //       $(this).parent().css("background", "lightblue");
         // }
         // switch ($(this).html()) {
         //    case '1':
         //    case '2':
         //    case '3':
         //    case '4':
         //       $(this).parent().css("background", "MediumSeaGreen");
         // }
         // switch ($(this).html()) {
         //    case '5':
         //    case '6':
         //    case '7':
         //    case '8':
         //       $(this).parent().css("background", "Orange");
         // }
         // switch ($(this).html()) {
         //    case '9':
         //    case '10':
         //    case '11':
         //    case '12':
         //       $(this).parent().css("background", "Crimson");
         // }
         switch ($(this).html()) {
            case '-4':
               $(this).parent().css("background", "#9b59b6");
               $(this).parent().addClass("shine");
         }
         switch ($(this).html()) {
            case '-2':
            case '-1':
               $(this).parent().css("background", "#3498db");
         }
         switch ($(this).html()) {
            case '0':
               $(this).parent().css("background", "#aed6f1");
         }
         switch ($(this).html()) {
            case '1':
            case '2':
            case '3':
            case '4':
               $(this).parent().css("background", "#27ae60");
         }
         switch ($(this).html()) {
            case '5':
            case '6':
            case '7':
            case '8':
               $(this).parent().css("background", "#ffb029");
         }
         switch ($(this).html()) {
            case '9':
            case '10':
            case '11':
            case '12':
               $(this).parent().css("background", "#e74c3c");
         }
      });
   }




   function mooveFocus(val) {
      $(".player").css({
         "border-color": "rgba(0,0,0,0)"
      });
      $(".j-" + val).css({
         "border-color": "#2c0e37ff"
      });

      //       $('.players').scrollLeft(99999);
      //    maxScroll = $('.players').scrollLeft();
      //    $('.players').scrollLeft(maxScroll*val);
      // setTimeout(() => {


      //    $(".players").animate({
      //       scrollLeft: $(".players").offset().left + ((maxScroll/nbjou) * val)
      //   }, 500);
      //   console.log(maxScroll);
      // }, 400);

   }



   function updatePoints(nujou, point) {
      (point >= 2 || point <= -2) ? pluri = "s" : pluri = "";

      $(".j-" + nujou + " > span > span").html(`${point} point${pluri}`);
   }

   function getPseudo() {
      return localStorage.getItem("pseudo");
   }

   socket.on('announce', (txt) => {
      consoleContent.prepend("<span>" + txt + "</span>");
   });

   $(document).on('click', '#seeRooms', function () {
      socket.emit('see rooms');
   });

   $(document).on('click', '#room_id', function () {
      tooltip($(this), "Copié !", 1200);
      var temp = $("<input>");
      $("body").append(temp);
      wcopy = window.location.href + roomId.html();
      temp.val(wcopy).select();
      document.execCommand("copy");
      temp.remove();
   });

   function tooltip(element, message, duration) {
      $(element).append("<div class='tooltip animate__animated animate__fadeInUp'><span>" + message + "</span></div>");
      setTimeout(function () {
         $(".tooltip").addClass("animate__fadeOutDown");
      }, duration);
      setTimeout(function () {
         $(".tooltip").remove();
      }, duration * 2);
   }

   function updateTimer() {
      ss++;
      if (ss == 60) {
         ss = 0;
         mm++;
      }

      if (mm.toString().length < 2) mm = "0" + mm;
      if (ss.toString().length < 2) ss = "0" + ss;
      $("#timer").html(mm + ":" + ss);
   }
   function playInterval() {
      updateTimer();
      interval = setInterval(function () { updateTimer() }, 1000);
      return false;
   }

   function stopInterval() {
      clearInterval(interval);
      return false;
   }

   function resetInterval() {
      ss = 0;
      mm = 0;
      return false;
   }
});