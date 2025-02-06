import * as gameUtils from './game-utils-functions.js';
import * as main from './index.js';

const animationDuration = 2050;

export function getResource(data) {
   let me = 0;
   let orderPlayer = 0;

   var type = data[3];

   const resourceFinalPos = {
      "wood": [$('.myinfo #my_wood').offset()],
      "stone": [$('.myinfo #my_stone').offset()],
      "clay": [$('.myinfo #my_clay').offset()],
      "sheep": [$('.myinfo #my_sheep').offset()],
      "wheat": [$('.myinfo #my_wheat').offset()]
   };

   if (type === "game") {
      $(`body`).append(`<div class="volatile-resource ${data[1]} rmeGame"></div>`);

      let resourceInitPos = $(`.rmeGame`).css({
         top: $(`#exchange_menu`).offset().top + 25,
         left: $(`#exchange_menu`).offset().left + 80
      });
      // glisser la ressource du bouton vers ses ressources
      if (data[2] === main.player.order) {
         gameUtils.playSound('pop');

         setTimeout(() => {
            resourceInitPos.css({
               top: (resourceFinalPos[data[1]][0].top - 8),
               left: (resourceFinalPos[data[1]][0].left - 35)
            });
         }, 50);
      }
      else {
         gameUtils.playSound('pop_');

         setTimeout(() => {
            resourceInitPos.css({
               top: ($('.scoreboard .j-' + data[2]).offset().top),
               left: ($('.scoreboard .j-' + data[2]).offset().left),
            });
         }, 50);
      }

      setTimeout(() => {
         $('.volatile-resource').remove();
      }, animationDuration);
   }
   else if (type === "port") {
      var portNumber = data[0];

      $(`body`).append(`<div class="volatile-resource ${data[1]} rmePort"></div>`);

      let resourceInitPos = $(`.rmePort`).css({
         top: $(`#port_` + portNumber).offset().top + 25,
         left: $(`#port_` + portNumber).offset().left + 20
      });

      if (data[2] === main.player.order) {
         gameUtils.playSound('pop');

         setTimeout(() => {
            resourceInitPos.css({
               top: (resourceFinalPos[data[1]][0].top - 8),
               left: (resourceFinalPos[data[1]][0].left - 35)
            });
         }, 50);
      }
      else {
         gameUtils.playSound('pop_');

         setTimeout(() => {
            resourceInitPos.css({
               top: ($('.scoreboard .j-' + data[2]).offset().top),
               left: ($('.scoreboard .j-' + data[2]).offset().left),
            });
         }, 50);
      }

      setTimeout(() => {
         $('.volatile-resource').remove();
      }, animationDuration);
   }
   else if (type === "trade") {

      $(`body`).append(`<div class="volatile-resource ${data[1]} rmeTrade"></div>`);

      let resourceInitPos = $(`.rmeTrade`).css({
         top: $(`.console`).offset().top,
         left: $(`.console`).offset().left
      });
      // glisser la ressource du bouton vers ses ressources
      gameUtils.playSound('pop');

      setTimeout(() => {
         resourceInitPos.css({
            top: (resourceFinalPos[data[1]][0].top - 8),
            left: (resourceFinalPos[data[1]][0].left - 35)
         });
      }, 50);

      setTimeout(() => {
         $('.volatile-resource').remove();
      }, animationDuration);
   }
   else {
      data.forEach((resource, i) => {
         setTimeout(() => {
            if (resource[2] === main.player.order) {
               gameUtils.playSound('pop');

               $(`body`).append(`<div class="volatile-resource ${resource[1]} rme${me}"></div>`);

               let resourceInitPos = $(`.rme${me}`).css({
                  top: $(`span.r${resource[0][0]}.l${resource[0][1]}.center`).offset().top,
                  left: $(`span.r${resource[0][0]}.l${resource[0][1]}.center`).offset().left
               });

               setTimeout(() => {
                  resourceInitPos.css({
                     top: (resourceFinalPos[resource[1]][0].top - 8),
                     left: (resourceFinalPos[resource[1]][0].left - 35)
                  });
               }, (i * 5) + 50); // + 50 permet de rajouter un délais suffisant pour le changement de style

               me++;
            }
            else {
               gameUtils.playSound('pop_');

               $(`body`).append(`<div class="volatile-resource ${resource[1]} rorderPlayer${orderPlayer}"></div>`);
               let resourceInitPos = $(`.rorderPlayer${orderPlayer}`);
               resourceInitPos.css({
                  top: $(`span.r${resource[0][0]}.l${resource[0][1]}.center`).offset().top,
                  left: $(`span.r${resource[0][0]}.l${resource[0][1]}.center`).offset().left
               });

               setTimeout(() => {
                  resourceInitPos.css({
                     top: ($('.scoreboard .j-' + resource[2]).offset().top),
                     left: ($('.scoreboard .j-' + resource[2]).offset().left)
                  });
               }, i * 5);

               orderPlayer++;
            }
            setTimeout(() => {
               $('.volatile-resource').remove();
            }, (data.length * 250) + animationDuration);
         }, i * 250);
      });
   }
};