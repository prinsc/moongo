// coord des points cliquables
const rc = {
   0: [6, 10, 14],
   1: [5, 7, 9, 11, 13, 15],
   2: [4, 8, 12, 16],
   3: [],
   4: [4, 6, 8, 10, 12, 14, 16],
   5: [],
   6: [4, 8, 12, 16],
   7: [3, 5, 7, 9, 11, 13, 15, 17],
   8: [2, 6, 10, 14, 18],
   9: [],
   10: [2, 4, 6, 8, 10, 12, 14, 16, 18],
   11: [],
   12: [2, 6, 10, 14, 18],
   13: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
   14: [0, 4, 8, 12, 16, 20],
   15: [],
   16: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
   17: [],
   18: [0, 4, 8, 12, 16, 20],
   19: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
   20: [2, 6, 10, 14, 18],
   21: [],
   22: [2, 4, 6, 8, 10, 12, 14, 16, 18],
   23: [],
   24: [2, 6, 10, 14, 18],
   25: [3, 5, 7, 9, 11, 13, 15, 17],
   26: [4, 8, 12, 16],
   27: [],
   28: [4, 6, 8, 10, 12, 14, 16],
   29: [],
   30: [4, 8, 12, 16],
   31: [5, 7, 9, 11, 13, 15],
   32: [6, 10, 14]
};

// coordonnées des centres des cases
const cp = [
   [3, 6],
   [3, 10],
   [3, 14],
   [7, 4],
   [7, 8],
   [7, 12],
   [7, 16],
   [11, 2],
   [11, 6],
   [11, 14],
   [11, 18],
   [15, 4],
   [15, 8],
   [15, 12],
   [15, 16],
   [19, 6],
   [19, 10],
   [19, 14]
];

/**
 * Il crée une grille d'hexagones, puis ajoute une classe au centre de chaque hexagone.
 */
export function make() {
   let i, j, k = 0, m = 0;
   // création de l'interactif
   for (i = 0; i < 33; i++) {
      $(".interactif").append("<div class='row r-" + i + "'></div>");
      if (!rc[k].length) {
         $('.r-' + i).addClass("empty");
         for (j = 0; j < 21; j++) {
            $(".r-" + i).append("<div class='col h'><span></span></div>");
         }
      }
      else {
         for (j = 0; j < 21; j++) {
            if (i == k && rc[k].includes(j)) {
               $(".r-" + i).append("<div class='col'><span></span></div>");
            }
            else {
               $(".r-" + i).append("<div class='col h'><span></span></div>");
            }
         }
      }
      if (!$(".r-" + i).hasClass("empty")) {
         for (j = 0; j <= 21; j++) {
            if (!$(".r-" + i + " > .col:nth-child(" + j + ")").hasClass("h")) {
               $(".r-" + i + "> .col:nth-child(" + j + ") > span").attr("data-coord-x", m);
               $(".r-" + i + "> .col:nth-child(" + j + ") > span").attr("data-coord-y", (j - 1));
               $(".r-" + i + "> .col:nth-child(" + j + ") > span").addClass("r" + m, "l" + (j - 1));
               $(".r-" + i + "> .col:nth-child(" + j + ") > span").addClass("l" + (j - 1));
            }
         }
         m++;
      }
      k++;
   }

   // génération du visuel 


   $('.visual').append(`
   <div class='row'>
      <div class='hexa water'></div>
      <div class='hexa water'></div>
      <div class='hexa water'></div>
   </div>
   <div class='row'>
      <div class='hexa water'></div>
      <div class='hexa water'></div>
   </div>
   `);
   $('.visual').prepend(`
   <div class='row'>
      <div class='hexa water'></div>
      <div class='hexa water'></div>
   </div>
   <div class='row'>
      <div class='hexa water'></div>
      <div class='hexa water'></div>
      <div class='hexa water'></div>
   </div>
   `);

   for (i = 0; i < 5; i++) {
      $('.visual > .row').append("<div class='hexa water'></div>");
      $('.visual > .row').prepend("<div class='hexa water'></div>");
   }

   // generate port
   $('.interactif .r-0 .col:nth-child(5)').addClass('port').attr("id", "p1").attr("data-port", 1).html(`
<div class="ctn" id="port_1">
   <div class="img"></div>
   <span></span>
</div>`);

   $('.interactif .r-0 .col:nth-child(13)').addClass('port').attr("id", "p2").attr("data-port", 2).html(`
<div class="ctn" id="port_2">
<div class="img"></div>
<span></span>
</div>`);

   $('.interactif .r-5 .col:nth-last-child(3)').addClass('port').attr("id", "p3").attr("data-port", 3).html(`
<div class="ctn" id="port_3">
<div class="img"></div>
<span></span>
</div>`);

   $('.interactif .r-16 .col:nth-last-child(2)').addClass('port').attr("id", "p4").attr("data-port", 4).html(`
<div class="ctn" id="port_4">
   <div class="img"></div>
   <span></span>
</div>`);

   $('.interactif .r-27 .col:nth-last-child(3)').addClass('port').attr("id", "p5").attr("data-port", 5).html(`
<div class="ctn" id="port_5">
   <div class="img"></div>
   <span></span>
</div>`);

   $('.interactif .r-32 .col:nth-child(13)').addClass('port').attr("id", "p6").attr("data-port", 6).html(`
<div class="ctn" id="port_6">
   <div class="img"></div>
   <span></span>
</div>`);

   $('.interactif .r-32 .col:nth-child(5)').addClass('port').attr("id", "p7").attr("data-port", 7).html(`
<div class="ctn" id="port_7">
   <div class="img"></div>
   <span></span>
</div>`);

   $('.interactif .r-22 .col:nth-child(1)').addClass('port').attr("id", "p8").attr("data-port", 8).html(`
<div class="ctn" id="port_8">
   <div class="img"></div>
   <span></span>
</div>`);

   $('.interactif .r-10 .col:nth-child(1)').addClass('port').attr("id", "p9").attr("data-port", 9).html(`
<div class="ctn" id="port_9">
   <div class="img"></div>
   <span></span>
</div>`);

   $('.r11.l10').parent().append('<div class="robber"></div>')
}