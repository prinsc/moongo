// catane client side
import * as gameUtils from './game-utils-functions.js';
import * as gameSocketMain from './game-socket-main.js';
import * as gameMain from './main-game.js';

var name = localStorage.getItem("pseudo");

export const socket = io("/games/catane");

let i, j;
let isGameProtected = false;

export const tourCount = $('#tour_count');
export const phase = $('#phase');

export const pseudo = $('#pseudo');
export const roomId = $('#idroom');

export const consoleContent = $('.text');
export const mainStart = $('.main_start');
export const gameActions = $('.main_actions');
export const roomWaiting = $('.main_waiting');
export const roomList = $('.room_list');
export const mainGame = $('.main_game');

pseudo.val(name)

export let player = {
   roomId: "waiting", // par défaut on est dans waiting
   username: "",
   socketId: "",
   order: 0,
   pass: ""
}

gameUtils.showElement(mainStart);

$(document).on('click', '#temp_see_rooms', function () {
   socket.emit('see rooms');
});
$(document).on('click', '#temp_see_players', function () {
   socket.emit('see players');
});
$(document).on('click', '#temp_see_player', function () {
   socket.emit('see player');
   console.log(player);
});

$(document).ready(function () {

   socket.on("connect", () => {

      new TxtAnime("h1", {
         effect: "txt-an-1",
         delayStart: 0.05,
         delay: 0.07,
         duration: 0.7,
         repeat: false
      });

      player.socketId = socket.id;
      gameUtils.showElement($(".interactif"), 200);

      $("form").submit(function (e) { e.preventDefault(); });

      // CREATE ROOM
      $(document).on('click', '#createRoom', function () {
         if (pseudo.val() != "") {
            if ((!isGameProtected && $('input#password').val() == "") || (isGameProtected && $('input#password').val() != "")) {
               $(this).attr("disabled", true);

               player.roomId = "";
               player.username = pseudo.val();

               if (isGameProtected) player.pass = $("input#password").val();

               localStorage.setItem("pseudo", player.username);
               socket.emit('create room', player);
            }
            else {
               gameUtils.bringButton('input#password');
            }
         } else {
            gameUtils.bringButton('input#pseudo');
         }
      });

      // CLICK ZOOM
      $(document).on('click', '#zoom', function () {
         let direction = $(this).data("where");
         gameUtils.zoomMap(direction);
      });

      // START ROOM
      $(document).on('click', '#start', function () {
         // vérifier les paramètres
         let params = Array();

         params.push($("#switch-alea").is(':checked'));
         params.push($("#switch-ext-fish").is(':checked'));
         params.push($("#switch-122").is(':checked'));
         params.push($("#switch-devcard").is(':checked'));

         socket.emit('start room', player, params);
      });

      // SEND MESSAGE
      $(document).on('click', '#sendMessage', function () {
         if ($('#message').val() !== "") {
            socket.emit('message', player, $('#message').val());
            $('#message').val("");
         }
      });

      // SET PASSWORD
      $(document).on('click', '#setPassword', function () {
         $('#applyPassword').css("width", $('#createRoom').outerWidth());
         if ($('.pass > div.col').hasClass('d-none')) {
            $('#setPassword').html('🔒');
            if (gameUtils.showElement($('.pass > div.col'), 0)) {
               isGameProtected = true;
               gameUtils.playSound("key-insertion");
            }
         }
         else {
            $('#setPassword').html('🔓');
            gameUtils.playSound("lock");
            gameUtils.hideElement($('.pass > div.col'), 0);
            isGameProtected = false;
            $('input#password').val("");
            player.pass = "";
         }
      });

      // APPLY PASSWORD
      $(document).on('click', '#applyPassword', function () {

         const passwordInput = $('input#password');
         const val = passwordInput.val();

         if (val == "") {
            gameUtils.bringButton(passwordInput);
            isGameProtected = false;
         } else {

            const statusElement = $('#applyPassword_status');

            player.pass = val;
            statusElement.html("Clé définie !");
            gameUtils.temporaryShowElement(statusElement, 1600);
            isGameProtected = true;
         }
      });

      // JOIN ROOM
      $(document).on('click', 'button.join', function () {
         const idOfRoom = $(this).data("room");
         if (pseudo.val() != "") {
            // on attribue les valeur au player
            player.username = pseudo.val();
            player.roomId = idOfRoom;
            localStorage.setItem("pseudo", player.username);

            // vérifier si la game a un mot de passe
            const passwordInput = $(`#passRoom_${idOfRoom}`);
            if (passwordInput.length) {
               let val = passwordInput.val();
               if (val.length > 0) {
                  // si le mot de passe est marqué 
                  player.pass = val;
               } else {
                  gameUtils.bringButton(passwordInput);
                  player.pass = false;
               }
            } else {
               player.pass = false;
            }

            socket.emit('join room', player);
         } else {
            gameUtils.bringButton(pseudo);
            player.pass = false;
         }
      });


      $('#confirm_echange_game').click(function () {
         let data = Array();

         data[0] = $('.echange_game .my_resources').find('.select').data('resource');
         data[1] = $('.echange_game .game_resources').find('.select').data('resource');
         console.log(data);

         socket.emit('click trade', "game", data);
         closeEchangeMenu();
      });

      $('#confirm_echange_port').click(function () {
         let data = Array();

         data[0] = $('.echange_port .my_resources').find('.select').data('resource');
         data[1] = $('.echange_port .game_resources').find('.select').data('resource');
         data[2] = $(this).attr("data-port");

         socket.emit('click trade', "port", data);
         closeEchangeMenu();
      });

      $('#confirm_echange_player').click(function () {
         let data = Array();

         data[0] = $('.echange_player .wanted_resource').find('.select').data('resource');
         data[1] = $(".my_resources .select").map(function () {
            return $(this).data("resource");
         }).get();
         data[2] = $('#player_list').find('.select').data('porder');

         socket.emit('click trade', "player", data);
         closeEchangeMenu();
      });

      // echange =============================================================
      $('.menu').on('click', '.el', function () {
         gameUtils.playSound("btn3");
      });
      $(".echange_port .my_resources").on("click", ".el", function () {
         $('.echange_port .my_resources .select').removeClass('select');
         $(this).addClass('select');
         checkEchangePortConfirm();
      });
      $(".echange_port .game_resources").on("click", ".el", function () {
         $('.echange_port .game_resources .select').removeClass('select');
         $(this).addClass('select');
         checkEchangePortConfirm();
      });
      // =============================================================
      $(".echange_game .my_resources").on("click", ".el", function () {
         $('.echange_game .my_resources .select').removeClass('select');
         $(this).addClass('select');
         checkEchangeGameConfirm();
      });
      $(".echange_game .game_resources").on("click", ".el", function () {
         $('.echange_game .game_resources .select').removeClass('select');
         $(this).addClass('select');
         checkEchangeGameConfirm();
      });
      // =============================================================
      $(".echange_player .my_resources").on("click", ".el", function () {
         $(this).toggleClass('select');
         checkEchangePlayerConfirm();
      });
      $(".echange_player .wanted_resource").on("click", ".el", function () {
         $('.echange_player .wanted_resource .select').removeClass('select');
         $(this).addClass('select');
         checkEchangePlayerConfirm();
      });
      $(".echange_with ul").on("click", "li", function () {
         $('.echange_with li.select').removeClass('select');
         $(this).addClass('select');
         checkEchangePlayerConfirm();
      });
      // =============================================================

      function checkEchangePlayerConfirm() {
         if ($(".echange_player .my_resources .el").hasClass('select') && $(".echange_player .wanted_resource .el").hasClass('select') && $(".echange_with li").hasClass('select')) {
            gameUtils.showElement($('#confirm_echange_player'));
         }
         else {
            gameUtils.hideElement($('#confirm_echange_player'));
         }
      }
      function checkEchangePortConfirm() {
         if ($(".echange_port .my_resources .el").hasClass('select') && $(".echange_port .game_resources .el").hasClass('select')) {
            gameUtils.showElement($('#confirm_echange_port'));
         }
      }
      function checkEchangeGameConfirm() {
         if ($(".echange_game .my_resources .el").hasClass('select') && $(".echange_game .game_resources .el").hasClass('select')) {
            gameUtils.showElement($('#confirm_echange_game'));
         }
      }
      function openEchangeMenu(what) {
         if ($('.menu').hasClass("d-none")) {
            gameUtils.showElement($('.menu'));
            gameUtils.playSound("btn5");
            $('.menu .el').remove();
            switch (what) {
               case "port":
                  $('.menu section.port').removeClass('d-none');
                  break;
               case "game":
                  $('.menu section.game').removeClass('d-none');
                  break;
               default:
                  $('.menu section.game').removeClass('d-none');
                  break;
            }

            mainGame.css('filter', 'opacity(80%)');
            return true;
         }
         else {
            return false;
         }
      }
      function closeEchangeMenu() {
         if (gameUtils.hideElement($('.menu'))) {
            $('.menu').find(".select").not("li.select").removeClass("select");
            setTimeout(() => {
               $('.menu section').addClass('d-none');
               $('.echange .el').remove();
            }, 500);
            gameUtils.hideElement($(".menu button.small"), 100);
            mainGame.css('filter', 'opacity(100%)');
            return true;
         }
         else {
            return false;
         }
      }

      $('.interactif').on('click', '.port', function () {
         socket.emit('click port', $(this).data("port"));
      });

      $("#exchange_menu").click(function () {
         socket.emit('click exchange');
      });

      socket.on('menu port', (resourceName, numPort) => {
         if (openEchangeMenu('port')) {
            var resources = [
               ["wood", $('.myinfo #my_wood').html()],
               ["stone", $('.myinfo #my_stone').html()],
               ["clay", $('.myinfo #my_clay').html()],
               ["sheep", $('.myinfo #my_sheep').html()],
               ["wheat", $('.myinfo #my_wheat').html()]
            ];

            $('.menu section.port button').attr("data-port", numPort);

            // port 3:1
            if (resourceName === "all") {
               resources.forEach((resource) => {
                  if (resource[1] >= 3) {
                     $('.menu section.port div.my_resources').append(`
                        <div class="el" data-resource="${resource[0]}">
                           <img class="ico" src="/medias/assets/games/catane/ressources/${resource[0]}.svg">
                           <span>3</span>
                        </div>
                        `);
                  }
               });
               resources.forEach((resource) => {
                  $('.menu section.port .game_resources').append(`
                        <div class="el" data-resource="${resource[0]}">
                           <img class="ico" src="/medias/assets/games/catane/ressources/${resource[0]}.svg">
                           <span>1</span>
                        </div>
                        `);
               });
            }

            // port 2:1
            else {
               if ($('.myinfo #my_' + resourceName).html() >= 2) {
                  $('.menu section.port .my_resources').append(`
                        <div class="el select" data-resource="${resourceName}">
                           <img class="ico" src="/medias/assets/games/catane/ressources/${resourceName}.svg">
                           <span>2</span>
                        </div>
                        `);
               }
               resources.forEach((resource) => {
                  if (resourceName != resource[0]) {
                     $('.menu section.port .game_resources').append(`
                     <div class="el" data-resource="${resource[0]}">
                        <img class="ico" src="/medias/assets/games/catane/ressources/${resource[0]}.svg">
                        <span>1</span>
                     </div>
                     `);
                  }
               });
            }
         }
      });

      socket.on('menu exchange', () => {
         if (openEchangeMenu()) {

            var resources = [
               ["wood", $('.myinfo #my_wood').html()],
               ["stone", $('.myinfo #my_stone').html()],
               ["clay", $('.myinfo #my_clay').html()],
               ["sheep", $('.myinfo #my_sheep').html()],
               ["wheat", $('.myinfo #my_wheat').html()]
            ];

            var hasElements = resources.some(function (resource) {
               return parseInt(resource[1]) > 3;
            });
            console.log(hasElements);

            if (hasElements) {
               $('.echange_game div.my_resources > *').remove();
               resources.forEach((resource) => {
                  if (resource[1] >= 4) {
                     $('.echange_game div.my_resources').append(`
                        <div class="el" data-resource="${resource[0]}">
                           <img class="ico" src="/medias/assets/games/catane/ressources/${resource[0]}.svg">
                           <span>4</span>
                        </div>
                        `);
                  }
               });
            } else {
               $('.echange_game div.my_resources').html(`<span>Pas assez de ressources</span>`);
            }




            resources.forEach((resource) => {
               $('.echange_game div.game_resources').append(`
                     <div class="el" data-resource="${resource[0]}">
                        <img class="ico" src="/medias/assets/games/catane/ressources/${resource[0]}.svg">
                        <span>1</span>
                     </div>
                     `);
            });

            // ==================================================

            resources.forEach((resource) => {
               if (resource[1] >= 1) {
                  $('.echange_player div.my_resources').append(`
                     <div class="el" data-resource="${resource[0]}">
                        <img class="ico" src="/medias/assets/games/catane/ressources/${resource[0]}.svg">
                        <span>1</span>
                     </div>
                     `);
               }
            });

            resources.forEach((resource) => {
               $('.echange_player div.wanted_resource').append(`
                     <div class="el" data-resource="${resource[0]}">
                        <img class="ico" src="/medias/assets/games/catane/ressources/${resource[0]}.svg">
                        <span>1</span>
                     </div>
                     `);
            });

         }
      });

      socket.on('update room', (data) => {
         gameSocketMain.updateRoom(data);
      });

      socket.on('set order', (newO) => {
         player.order = newO;
      });

      socket.on('start room', (idOfRoom, status, map) => {
         if (gameSocketMain.startRoom(status, map)) {
            player.roomId = idOfRoom;
            console.log(`#${idOfRoom} started`);
         }
      });

      socket.on('get resource', (data) => {
         gameMain.getResource(data);
      });

      socket.on('set points', (data) => {
         for (i = 0; i < data.length; i++) {
            // if (i == 9) continue;
            $(`.r${data[i].x}.l${data[i].y}`).addClass('center').html(data[i].value);
         }
      });

      socket.on('set ports', (data) => {

         for (i = 0; i < data.length; i++) {
            switch (data[i]) {
               case 'all':
                  $('#port_' + (i + 1) + ' .img').html(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M12 19c.828 0 1.5.672 1.5 1.5S12.828 22 12 22s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm0-17c3.314 0 6 2.686 6 6 0 2.165-.753 3.29-2.674 4.923C13.399 14.56 13 15.297 13 17h-2c0-2.474.787-3.695 3.031-5.601C15.548 10.11 16 9.434 16 8c0-2.21-1.79-4-4-4S8 5.79 8 8v1H6V8c0-3.314 2.686-6 6-6z"/></svg>`);
                  $('#port_' + (i + 1) + ' span').html("3:1");
                  break;
               default:
                  $('#port_' + (i + 1) + ' .img').html(`<img class="ico" src="/medias/assets/games/catane/ressources/` + data[i] + `.svg">`);
                  $('#port_' + (i + 1) + ' span').html("2:1");
                  break;
            }
         }
      });

      // ! main socket 

      let nb_message = 0;

      socket.on('announce', (order, who, txt) => {

         gameUtils.announce(order, who, txt, nb_message);

         // var element = ".message.m" + nb_message;

         // new TxtAnime(element, {
         //    effect: 'txt-an-1',
         //    delayStart: 0,
         //    delay: 0.01,
         //    duration: 0.05,
         //    repeat: false
         // });

         nb_message++;

      });

      socket.on('announce-big', (type, txt) => {
         gameUtils.announceBig(type, txt);
      });

      socket.on('leave room', () => {
         console.log("Disconnect from the room");
         gameSocketMain.disconnect();
      });

      socket.on('update room info', (data) => {
         gameSocketMain.updateRoomInfo(data);
      });

      socket.on('join room', (idOfRoom, status, isHost, nbP) => {
         if (gameSocketMain.joinRoom(idOfRoom, status, isHost, player, nbP)) {
            console.log("Connected to " + idOfRoom);
         }
      });

      socket.on('show rooms', (data) => {
         gameSocketMain.showRooms(data)
         console.log(data)
      });

      socket.on('roll dice', (data) => {
         $("#dice1").attr("data-side", data[0]).toggleClass("reRoll");
         $("#dice2").attr("data-side", data[1]).toggleClass("reRoll");
         gameUtils.replaceContent($("#dice-result"), data[0] + data[1]);
      });

      $(document).on('click', '#roll-dice', function () {
         socket.emit('roll dice');
      });

      $(document).on('click', '#end_tour', function () {
         socket.emit('click action', 'end_tour');
         gameUtils.playSound("btn5");
      });

      $(document).on('click', '#buy_devcard', function () {
         socket.emit('click action', 'buy_devcard');
         gameUtils.playSound("btn5");
      });

      $(document).on('click', '#accept_trade_player', function () {
         socket.emit('click trade', "accept", player);
         gameUtils.playSound("btn5");

      });

      $(document).on('click', '#reject_trade_player', function () {
         socket.emit('click trade', "reject", player);
         gameUtils.playSound("btn5");
      });

      // coord click
      $(document).on('click', 'div.game div.interactif > .row > .col > span', function () {
         const dataX = $(this).data("coord-x");
         const dataY = $(this).data("coord-y");
         var data = [dataX, dataY];
         console.log(data)
         socket.emit('coord', data);
      });

      socket.on('set placement', (data) => {
         if (data[0].placement == "robber") {
            console.log("robber placé");
            $('.robber').remove();
            $('.r' + data[0].x + '.l' + data[0].y).parent().append(`<div class="robber"></div>`);
         }
         else {
            // console.log(data);
            $('.r' + data[0].x + '.l' + data[0].y).html(`<div class="${data[0].placement} c-player-${data[0].owner}"></div>`);
         }
      });

      socket.on('play sound', (sound) => {
         gameUtils.playSound(sound);
      });

      $(document).ready(function () {
         $(document).keyup(function (event) {
            if (event.keyCode === 13) {
               $("#sendMessage").click();
            }
         });
      });
      $('.console').click(function (event) {
         if (!$(event.target).is('input, button')) {
            $('.main').toggleClass('expanded');
         }
      });
      $(document).on('keydown click', function (event) {
         if (event.key === "Escape" || event.target.matches(".menu, #close_menu, #close_menu *")) {
            closeEchangeMenu();
            gameUtils.playSound("btn5");
         }
      });
   });
});
