
  var jeux = [];
  var visible = [];
  var defausse = [];
  var points = [];

  var i, y = 0;
  var nb_joueurs = 2;

  let whoplay = 0;

  var dernierTour = false;
  var dernierTourWho = 999;
  var theEnd = false

  var pluri = ""

  var tour = 0;
  var tour_global = 0;
  var max = 0;
  var whoo = false

  var joueur = new Array(nb_joueurs)
  var points_retournement = new Array(nb_joueurs);

  // ! création jeux de carte 
  for (i = 0; i < 5; i++) {
    jeux.push("-2");
  }
  for (i = 0; i < 15; i++) {
    jeux.push("0");
  }
  for (i = 0; i < 10; i++) {
    jeux.push("-1");
    jeux.push("1");
    jeux.push("2");
    jeux.push("3");
    jeux.push("4");
    jeux.push("5");
    jeux.push("6");
    jeux.push("7");
    jeux.push("8");
    jeux.push("9");
    jeux.push("10");
    jeux.push("11");
    jeux.push("12");
  }
  // ==================================
  // ! mélange du jeux de carte 
  // ==================================
  function shuffleArray(inputArray) {
    inputArray.sort(() => Math.random() - 0.5);
  }
  shuffleArray(jeux);

  // ==================================
  // ! Fonction du jeux 
  // ==================================
  function updateGame() {

    // - modification des couleurs
    // - maj pile carte
    // - maj pile défausse
    // - retirer colonne

    $(".jeux_cartes > div > span").each(function () {
      switch ($(this).html()) {
        case '-2':
        case '-1':
          $(this).parent().css("background", "DodgerBlue");
      }
      switch ($(this).html()) {
        case '0':
          $(this).parent().css("background", "lightblue");
      }
      switch ($(this).html()) {
        case '1':
        case '2':
        case '3':
        case '4':
          $(this).parent().css("background", "MediumSeaGreen");
      }
      switch ($(this).html()) {
        case '5':
        case '6':
        case '7':
        case '8':
          $(this).parent().css("background", "Orange");
      }
      switch ($(this).html()) {
        case '9':
        case '10':
        case '11':
        case '12':
          $(this).parent().css("background", "Crimson");
      }
    });

    $('#nbr_cartes').html(jeux.length);
    $('#nbr_cartes_defausse').html(defausse.length);
    $(".defausse > .jeux_cartes > div > span").html(defausse[0]);
  }

  function removeCardGame(nbre) {
    jeux.splice(0, nbre);
    updateGame();
  }

  function removeCardDiscard(carte) {
    defausse.unshift(carte);
    updateGame();
  }

  function announce(txt) {
    if (txt != "") {
      $(".text").prepend("<span>" + txt + "</span>");
    }
  }

  function lastTour(who, player) {
    if (who == 0 && player == nb_joueurs - 1) { // si c'est le premier qui finit
      theEnd = true
      announce("C'est le premier joueur qui a finit")
    }
    if (who == nb_joueurs - 1 && player == who - 1) { // si c'est le dernier qui finit
      theEnd = true
      announce("C'est le dernier joueur qui a finit")
    }
    if (player == who - 1) { // si c'est le milieu qui finit
      theEnd = true
      announce("C'est le joueur " + who + " qui a finit")
    }
    if (theEnd) {
      announce("✅ La manche est finis !")
      endGame(); // ? hallelujah
    }
  }

  function endGame() {
    // calcul points des points
    for (i = 0; i < nb_joueurs; i++) {
      for (y = 0; y < 12; y++) {
        points[i] = parseInt(points[i]) + parseInt(joueur[i][y]);
      }
      if (points[i] >= 2) pluri = "s"
      $('#nb-points-' + i).html(points[i] + " point" + pluri); // affichage des points
    }

    // retourner les cartes de tout le monde
    for (i = 0; i < nb_joueurs; i++) {
      for (y = 0; y < 12; y++) {
        $(".j-" + i + " > .jeux_cartes > div#" + (i) + y).removeClass("nvi")
        $(".j-" + i + " > .jeux_cartes > div#" + (i) + y + " > span").html(joueur[i][y])
        $(".j-" + i + " > .jeux_cartes > div#" + (i) + y).addClass("stopEvent")
        updateGame();
      }
    }

    dernierTour = false

    // initialiser defausse
    // initialiser jeux
    // distribuer
  }

  function removeCol(nujou, nbCol) {

  }

  // ==================================
  // ! Changer de carte
  // ==================================

  function change(carte, nujou) {

   //  valeur_enleve = joueur[nujou][carte];
   //  valeur_new = defausse[0];

   //  joueur[nujou][carte] = valeur_new
   //  $('div#' + (nujou) + carte + " > span").html(valeur_new)
    defausse[0] = valeur_enleve

    $(".defausse > .jeux_cartes > div > span").html(valeur_enleve);
    $('div#' + (nujou) + carte).removeClass("nvi");

   //  visible[nujou][carte] = 1 // on retiens que la carte est maintenant visible

    //points[nujou] = parseInt(points[nujou]) + valeur_new

    // ! retirer colonne
    //removeCol(nujou, nbCol)

    // premiere rangé 
    if (carte < 4) {
      if (visible[nujou][carte + 4] == 1 && visible[nujou][carte + 8] == 1) {
        if (joueur[nujou][carte + 4] == valeur_new && joueur[nujou][carte + 8] == valeur_new) {

          announce("⚠️ Le joueur " + (nujou + 1) + " vient de retirer sa colonne de " + joueur[nujou][carte + 4] + ".");
          // supprimer la colonne
          nb_col = $(".j-" + nujou + " > .jeux_cartes").css("grid-template-columns")
          $(".j-" + nujou + " > .jeux_cartes").css("grid-template-columns", nb_col.slice(0, -4))

          // ajouter à la defausse
          removeCardDiscard(joueur[nujou][carte + 4])

          for (y = 0; y < 3; y++) {
            // supprimer de la liste des cartes 
            joueur[nujou][carte] = 0

            // ne plus afficher dans le jeux
            $(".j-" + nujou + " > .jeux_cartes > div#" + nujou + carte).css("display", "none")

            carte = carte + 4
          }
        }
      }
    }
    // deuxieme rangé
    else if (carte < 8) {
      if (visible[nujou][carte + 4] == 1 && visible[nujou][carte - 4] == 1) {
        if (joueur[nujou][carte + 4] == valeur_new && joueur[nujou][carte - 4] == valeur_new) {

          announce("⚠️ Le joueur " + (nujou + 1) + " vient de retirer sa colonne de " + joueur[nujou][carte + 4] + ".");
          // supprimer la colonne
          nb_col = $(".j-" + nujou + " > .jeux_cartes").css("grid-template-columns")
          $(".j-" + nujou + " > .jeux_cartes").css("grid-template-columns", nb_col.slice(0, -4))

          carte = carte - 4

          // ajouter à la defausse
          removeCardDiscard(joueur[nujou][carte])
          for (y = 0; y < 3; y++) {
            // définir comme quoi les cartes valent 0 de la liste des cartes 
            joueur[nujou][carte] = 0

            // ne plus afficher dans le jeux
            $(".j-" + nujou + " > .jeux_cartes > div#" + nujou + carte).css("display", "none")

            carte = carte + 4
          }
        }
      }
    }
    // troisieme rangé
    else {
      if (visible[nujou][carte - 4] == 1 && visible[nujou][carte - 8] == 1) {
        if (joueur[nujou][carte - 4] == valeur_new && joueur[nujou][carte - 8] == valeur_new) {

          announce("⚠️ Le joueur " + (nujou + 1) + " vient de retirer sa colonne de " + joueur[nujou][carte - 4] + ".");
          // supprimer la colonne
          nb_col = $(".j-" + nujou + " > .jeux_cartes").css("grid-template-columns")
          $(".j-" + nujou + " > .jeux_cartes").css("grid-template-columns", nb_col.slice(0, -4))

          // ajouter à la defausse
          removeCardDiscard(joueur[nujou][carte - 4])

          for (y = 0; y < 3; y++) {
            // supprimer de la liste des cartes 
            joueur[nujou][carte] = 0
            // ne plus afficher dans le jeux
            $(".j-" + nujou + " > .jeux_cartes > div#" + nujou + carte).css("display", "none")

            carte = carte - 4
          }
        }
      }
    }
    // vérifier si c'est le dernier tour pour ce joueur 
    if (visible[nujou].every((val, i, arr) => val === arr[0]) && dernierTour === false) {
      announce("⚠️ ATTENTION DERNIER TOUR ⚠️")
      dernierTour = true
      dernierTourWho = nujou
    }

    // finir le tour si c'était le dernier
    if (dernierTour === true) {
      lastTour(dernierTourWho, nujou)
    }
    updateGame();
  }

  // ! initialisation joueur
  for (i = 0; i < nb_joueurs; i++) {

    joueur[i] = new Array(12);
    visible[i] = new Array(12);
    points[i] = 0;

    for (y = 0; y < 12; y++) {
      joueur[i][y] = jeux[y]
      visible[i][y] = 0 // toute les cartes sont invisibles
    }
    if (points[i] >= 2) pluri = "s"

    var txt = "<div class='j-" + i + "'><span>Joueur " + (i + 1) + " <span id='nb-points-" + i + "'>" + points[i] + " point" + pluri + "</span></span><div class='other jeux_cartes'>";

    // afficher carte
    for (y = 0; y < 12; y++) {
      txt = txt + "<div class='nvi' id='" + i + y + "'><span></span></div>";
    }
    txt = txt + "</div>";
    $(".joueurs").append(txt);
    removeCardGame(12);

  }

  // ! initialisation qui commence

  function turnCard(carte, nujou) {
    var valeur = joueur[nujou][carte];

    // calcul des points pour le retournement
    if (points_retournement[nujou] === undefined)
      points_retournement[nujou] = valeur;
    else
      points_retournement[nujou] = parseInt(points_retournement[nujou]) + parseInt(valeur);

    $('div#' + nujou + carte).removeClass("nvi");

    $('div#' + nujou + carte + ' > span').html(valeur)
    $('div#' + nujou + carte).addClass("stopEvent");

    visible[nujou][carte] = 1 // on retiens que la carte est maintenant visible
    updateGame();
  }

  $('div.j-' + whoplay + " > .jeux_cartes").removeClass("other");
  announce("C'est au joueur " + (whoplay + 1) + " de commencer");

  // ! Début du jeux 

  function nextRound() {
    $('div.j-' + whoplay + " > .jeux_cartes").addClass("other");

    if (whoplay == nb_joueurs - 1) whoplay = 0
    else whoplay = whoplay + 1;

    $('div.j-' + whoplay + " > .jeux_cartes").removeClass("other");
    $(".jeux > .jeux_cartes > div.tirage").removeClass("stopEvent");

    atiltire = false
    announce("C'est au joueur " + (whoplay + 1) + " de jouer")
    updateGame();
  }

  // ! Déterminer le premier joueur

  function whoStart() {
    for (i = 0; i < nb_joueurs; i++) {
      if (points_retournement[i] > max) {
        max = points_retournement[i]
      }
    }
    who = points_retournement.indexOf(max)
    return who;
  }

  // ! Retournement de carte

  announce("Retournez deux cartes");

  // ! Choix n°1 : On tire
  for (i = 0; i < nb_joueurs; i++) {
    if (!whoo) {

      $(".j-" + i + " > .jeux_cartes > div").click(function (event) {

        tour_global++

        if (tour_global <= nb_joueurs * 2) {
          turnCard($(this).index(), whoplay);
          tour++;

          if (tour == 2) { // si le joueur a retourné ses deux cartes
            nextRound();
            announce("Retournez deux cartes");
            tour = 0
            point = 0
          }
          if (tour_global == nb_joueurs * 2) { // si on a terminé le retournement

            // on signale que le tour de retournement est terminé
            whoo = true;

            announce("C'est au joueur " + (whoStart() + 1) + " de commencer car il a " + points_retournement[whoStart()] + " points !");

            // commence celui qui a le plus de points de retournement
            whoplay = whoStart();

            // tous les autres sont bloqué
            $('.joueurs div.jeux_cartes').addClass("other");

            // sauf celui qui commence
            $('div.j-' + whoStart() + ' > div.jeux_cartes').removeClass("other");
            // announce("Piocher dans le jeux")

            // on autorise de changer les cartes déjà retournées
            $('div').removeClass("stopEvent");

            // ! Debut du jeux

            atiltire = false

            // ! soit on tire pour changer ou passer
            $(".jeux > .jeux_cartes > div.tirage").click(function (event) {

              atiltire = true // on précise qu'il vient de tirer
              tirage = jeux[0];

              $(".jeux > .jeux_cartes > div.tirage").addClass("stopEvent"); // on tire
              announce("Le joueur vient de tirer la carte " + jeux[0] + ".");

              // ? animation 
              animation = 800;
              // on clone la carte pour l'animer
              $(".jeux > .jeux_cartes > div.tirage").clone().appendTo(".jeux > .jeux_cartes").addClass("temp").ready(function () {

                // on dit à la carte de se décaller à droite et rotate en Y
                $(".jeux > .jeux_cartes > div.tirage.temp").css("transform", "translateX(250px) rotateY(180deg)")

                // en même temps à la moitié du temps on lui donne sa valeur et sa couleur
                setTimeout(function () {

                  $(".jeux > .jeux_cartes > div.tirage.temp > span").html(jeux[0]); // on donne la valeur
                  $(".jeux > .jeux_cartes > div.tirage.temp > span").css("opacity", "1");
                  $(".jeux > .jeux_cartes > div.tirage.temp > span").css("transform", "translateX(0) rotateY(180deg)")
                  updateGame(); // on donne la couleur

                }, animation / 2)

                setTimeout(function () {

                  removeCardDiscard(jeux[0]) // on ajoute la derniere carte du jeux à la defausse
                  removeCardGame(1); // on supprime la derniere carte du jeux à la defausse

                  setTimeout(function () {

                    $(".jeux > .jeux_cartes > div.tirage.temp").remove() // on supprime la carte d'animation

                  }, animation / 8);

                  updateGame();

                }, animation)

              });
              // ? fin animation 

              // ! choix n°1-1 on change
              $(".j-" + i + " > .jeux_cartes > div").click(function (event) {
                console.log("on change")

                change($(this).index(), whoplay);
                nextRound();
              });

              // ! choix n°1-2 on next
              $("#next").click(function (event) {
                for (i = 0; i < nb_joueurs; i++) {
                  if (dernierTour === true) {
                    lastTour(dernierTourWho, i)
                  } else {
                    if (atiltire) {
                      nextRound();
                    }
                  }
                }
              });
            });
          }
        } else {
          whoo = true;
        }
      });
    }
  }

  // ! Choix n°2 : changer
  for (y = 0; y < nb_joueurs; y++) {

    $(".j-" + y + " > .jeux_cartes > div").click(function (event) {
      if (defausse.length != 0) {
        change($(this).index(), whoplay);
        // removeCardGame(1); // on supprime la derniere carte du jeux à la defausse
        nextRound();
      } else {
        if (whoo) {
          announce("Piochez dans le jeux");
        }
      }
    });
  }
  updateGame();