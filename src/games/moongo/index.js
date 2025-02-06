// moongo server side

module.exports = { run };

let rooms = [];
let error = false;

function run(moongoRep, socket) {

   const utils = require('../../utils.js');


   // afficher la connexion 
   utils.consoleLog("positive", `${socket.id} connected to moongo`);
   sendClientRoomsData();

   const MIN_PLAYER = 1;
   const MAX_PLAYER = 8;
   const MAX_POINT = 100;

   // CREATE ROOM
   socket.on('create room', (player) => {
      let room = null;

      // si le joueur n'a pas room
      if (!player.roomId) {

         atiltirer = false;

         // si une room est crée, on l'affiche chez tout le monde
         room = createRoom(player);

         // le socket qui a créer la room la rejoins
         socket.join(room.id);

         // on le préviens qu'on joins la room
         moongoRep.to(socket.id).emit('join room', room.id);

         sendClientRoomsData();
         sendClientRoomsPlayersData(room.id);

      } else {
         // dans le cas où il connait la room
         utils.consoleLog("alert", "Il a une room");
         return;
      }
   });


   // JOIN ROOM
   socket.on('join room', (player) => {
      let room = null;

      // si le joueur a une roomId en donnée
      if (player.roomId) {
         // on récupère et on stock son username
         player.username = utils.newStringCharacter(player.username);

         // si l'username n'est pas vide
         if (player.username !== "") {
            room = rooms.find(r => r.id === player.roomId);

            if (room === undefined) {
               utils.consoleLog("alert", "Room === undefined");
               return;
            } else {
               // vérifier si le socketId du joueur est déjà dans la rommId qu'il a choisis
               rooms.forEach(r => {
                  r.players.forEach(p => {

                     if (r.id == p.roomId) {

                        // vérifier si un p id = socket id
                        if (p.socketId == socket.id) {
                           // doublon
                           utils.consoleLog("info", `${socket.id} ${player.username} is already in #${room.id}`);
                           utils.consoleLog("alert", "Double player");
                           error = true;
                           return;
                        }
                        // vérifier la game est full
                        if (r.players.length >= 8) {
                           utils.consoleLog("alert", "Max player");
                           error = true;
                           return;
                        }
                        // vérifier la game a démarré
                        if (r.beginGame) {
                           utils.consoleLog("alert", "Game begin");
                           error = true;
                           return;
                        }
                     }
                  });
               });

               if (!error) {
                  player.order = room.players.length
                  player.roomId = room.id;
                  room.players.push(player);
                  playSound("all", room.id, "join-game");
                  playSound("me", 0, "join-game");
               } else {
                  utils.consoleLog("alert", "Error");
               }
            }
         } else {
            utils.consoleLog("warning", `${socket.id} has no username`);
            error = true;
            return;
         }
      }

      // s'il a n'a pas de room id
      else {
         utils.consoleLog("warning", `${socket.id} has no room id`);
         error = true;
         return;
      }

      // s'il n'y a pas d'erreur
      if (!error) {
         socket.join(room.id);

         sendClientRoomsPlayersData(room.id);
         sendClientRoomsData();

         utils.consoleLog("positive", `${socket.id} ${player.username} join #${room.id}`);
      }
      error = false;
   });

   socket.on('get rooms', () => {
      rooms.forEach(r => {
         r.players.forEach(p => {
            if (p.socketId == socket.id && p.roomId == r.id) {
               if ((p.host)) {
                  if (r.players.length >= MIN_PLAYER && r.players.length <= MAX_PLAYER) {
                     moongoRep.to(socket.id).emit('show rooms', r.id, socket.id, r.players.length);
                  }
               }
            }
         })
      })
   });

   // ! temporary SEND ROOM
   socket.on('see rooms', () => {
      console.log(JSON.stringify(rooms, null, 2));
   });

   // SEND MESSAGE
   socket.on('message', (message) => {
      if (message != "") {
         message = message.substring(0, 64);
         rooms.forEach(r => {
            r.players.forEach(p => {
               if (p.roomId == r.id) {

                  if (socket.id == p.socketId) {

                     // on format le texte
                     message = message.replace(/\s|\n|&nbsp;/g, ' ');
                     message = message.replace(/<[^>]+>/gm, '');
                     message = message.replace(/(<([^>]+)>)/gi, "");

                     // on envoie une notification sonore
                     playSound("all", r.id, "message-receive");

                     // on envoie le message à tous les joueurs
                     moongoRep.to(r.id).emit('announce', `${p.username} : ${message}`);
                     utils.consoleLog("standard", `#${r.id} - ${p.username} : ${message}`)
                  }
               }
            })
         })
      }
   });

   // START GAME
   socket.on('start game', (player) => {

      // si c'est bien l'host qui a lancé
      rooms.forEach(r => {

         // la game n'a pas encore start
         if (!r.start) {

            // si l'id de la room correspond à celui du joueur
            if (r.id === player.roomId) {

               // s'il y a bien plus de deux joueurs et moins de 8
               if (r.players.length >= MIN_PLAYER && r.players.length <= MAX_PLAYER) {


                  var username = utils.newStringCharacter(player.username);

                  utils.consoleLog("info", `${socket.id} ${username} start game #${player.roomId}`);

                  userNameList = [];
                  userPoint = [];

                  if (r.players[0].host && r.players[0].socketId == socket.id) {
                     r.players.forEach(p => {
                        if (r.id == player.roomId) {
                           // la partie a commencé 
                           r.start = true;

                           // on prévient tout le monde
                           sendClientRoomsData();

                           p.nbCol = 4;
                           p.visible = [];
                           p.cartes = [];
                           p.points = 0;
                           p.pointGlobal = 0;

                           for (i = 0; i < 12; i++) {
                              p.cartes[i] = r.jeux[i];
                              p.visible[i] = 0;
                           }

                           r.jeux.splice(0, 12);

                           userNameList.push(p.username);
                           userPoint.push(p.points);
                        }
                     });
                     r.lastTour = 0; // c'est au joueur 0 de commencer


                     r.players.forEach(p => {
                        moongoRep.to(p.socketId).emit('start game', r.players.length, userNameList, p.order, r.tourCount);
                     });

                     moongoRep.to(r.id).emit('announce', `Le premier arrivé à ${MAX_POINT} a perdu !`);
                     moongoRep.to(r.id).emit('announce', "Retournez deux cartes");
                     moongoRep.to(r.id).emit('update game',
                        r.id,
                        r.jeux.length,
                        r.defausse.length,
                        r.lastTour,
                        r.tour
                     );
                  }

               } else {
                  utils.consoleLog("alert", `Pas assez de joueurs`);
               }
            }
         } else {
            // la game a déjà start
         }

      });
      userPoint = null;
      userNameList = null;
   });

   // CLICK REPLAY
   socket.on('replay', (player) => {

      // vérifier si le joueur qui a cliqué est le host de la room
      for (r of rooms) {

         for (p of r.players) {

            // le joueur est dans le room qu'il dit
            if (player.roomId === r.id) {

               // le socket du joueur est bien égal au socket envoyé
               if (r.players[0].host && r.players[0].socketId == socket.id) {

                  // le joueur en question est host
                  if (p.host) {

                     if (r.theEnd) {

                        r.jeux = [];
                        r.defausse = [];
                        r.lastTour = 0;
                        r.beginGame = false;
                        r.theEnd = false;
                        r.theEndWho = 0;
                        r.finishRound = false;
                        r.finishGame = false;
                        r.tour = 0;

                        // création jeux de carte 

                        createGameCards(r);

                        userNameList = [];
                        userPoint = [];

                        r.players.forEach(p => {
                           if (r.id == player.roomId) {
                              // la partie a commencé 
                              r.start = true;

                              // on prévient tout le monde
                              sendClientRoomsData();

                              p.nbCol = 4;
                              p.visible = [];
                              p.cartes = [];
                              p.points = 0;

                              for (i = 0; i < 12; i++) {
                                 p.cartes[i] = r.jeux[i];
                                 p.visible[i] = 0;
                              }

                              // on retire 12 cartes du jeux
                              r.jeux.splice(0, 12);

                              userNameList.push(p.username);
                              userPoint.push(p.points);
                           }
                        });
                        r.lastTour = 0; // c'est au joueur 0 de commencer
                        r.players.forEach(p => {
                           moongoRep.to(p.socketId).emit('start game', r.players.length, userNameList, p.order, r.tourCount);
                        });

                        moongoRep.to(r.id).emit('announce', `Le premier arrivé à ${MAX_POINT} a perdu !`);
                        moongoRep.to(r.id).emit('announce', "Retournez deux cartes");
                        moongoRep.to(r.id).emit('update game',
                           r.id,
                           r.jeux.length,
                           r.defausse.length,
                           r.lastTour
                        );
                     } else {
                        announce("La partie a déjà démarrée.");
                     }
                  }
               }
            }
         }
      }
   });

   // SEND SOCKET
   socket.on('socket', () => {
      moongoRep.to(socket.id).emit('socket', socket.id);
   });

   // CLICK TIRAGE
   socket.on('click draw', (player) => {

      for (r of rooms) {

         for (p of r.players) {

            if (player.roomId === r.id) {

               if (p.socketId === socket.id) {

                  // ! phase de retournement
                  if (r.beginGame) {

                     // le joueur qui clique est celui qui a le droit de jouer
                     if (r.lastTour === p.order) {


                        if (!canPlay(r)) {
                           atiltirer = false;
                           break;
                        }


                        if (!atiltirer) { // si atiltirer est faux
                           // on récupère la valeur
                           tirage = r.jeux[0];

                           // on note que le joueur a tirer une carte
                           atiltirer = true;

                           // on ajoute à la defausse
                           r.defausse.unshift(tirage);
                           r.jeux.splice(0, 1);

                           playSound("all", r.id, "card-flip-2");

                           moongoRep.to(r.id).emit('announce', `${r.players[r.lastTour].username} a tiré la carte ${tirage}`);
                           moongoRep.to(r.id).emit('draw', tirage);

                        } else {
                           utils.consoleLog("alert", `Le joueur a tirer alors qu'il ne pouvait pas`); // ! contournement
                        }

                     } else {
                        announce("<i class='ico pr-denied s-64'></i> Ce n'est pas ton tour");
                     }
                  } else {
                     announce("<i class='ico pr-denied s-64'></i> La partie n'a pas commencée, tous les joueurs doivent avoir retourné deux cartes");
                  }
               }
            }
         }
      }
   });

   // REMOVE ROOMS
   socket.on('remove room', (player) => {
      for (r of rooms) {

         for (p of r.players) {

            if (player.roomId === r.id) {

               if (p.socketId === socket.id) {

                  if (p.host) {
                     // ! on doit supprimer la room
                     room = r;
                     rooms = rooms.filter(r => r !== room);

                     // on deconnecte les autres utilisateurs qui sont dans cette room
                     moongoRep.to(r.id).emit('leave room')
                     for (i = 0; i < r.players.length; i++) {
                        utils.consoleLog("negative", `${r.players[i].socketId} ${r.players[i].username} left #${room.id}`);
                     }

                     sendClientRoomsData();

                     utils.consoleLog("info", `${socket.id} ${p.username} remove #${r.id}`);

                     sendClientRoomsPlayersData()

                     return;
                  }
               }
            }
         }
      }
   });

   // CLICK NEXT
   socket.on('next', (player) => {

      for (r of rooms) {

         for (p of r.players) {

            if (player.roomId === r.id) {

               if (p.socketId === socket.id) {

                  // ! phase de retournement
                  if (r.beginGame) {

                     // le joueur qui clique est celui qui a le droit de jouer
                     if (r.lastTour === p.order) {

                        if (!canPlay(r)) {
                           atiltirer = false;
                           tempTour = null;
                           break;
                        }

                        // si c'est le dernier tour
                        if (r.theEnd) {

                           if (r.theEndWho == 0 && r.lastTour == r.players.length - 1) r.finishRound = true // si c'est le premier qui finit

                           if (r.theEndWho == r.players.length - 1 && r.lastTour == r.theEndWho - 1) r.finishRound = true // si c'est le dernier qui finit

                           if (r.lastTour == r.theEndWho - 1) r.finishRound = true; // si c'est le milieu qui finit 

                           // la manche est finie
                           if (r.finishRound) {
                              atiltirer = false;
                              tempTour = null;
                              verifLastColumns();
                              break;
                           }

                        }

                        // s'il a tiré une carte alors il peut passer
                        if (atiltirer) {

                           tempTour = r.lastTour;

                           parseInt(r.lastTour) + 1 == r.players.length ? r.lastTour = 0 : r.lastTour++;

                           moongoRep.to(r.id).emit('announce', `${r.players[tempTour].username} a passé`);
                           moongoRep.to(r.id).emit('tour suivant', r.lastTour);

                           // on envoie un son au joueur qui doit jouer
                           moongoRep.to(r.players[r.lastTour].socketId).emit('play waiting');

                           atiltirer = false;
                           tempTour = null;

                        } else {
                           announce("<i class='ico pr-denied s-64'></i> Tu ne peux pas passer !");
                        }
                     } else {
                        announce("<i class='ico pr-denied s-64'></i> Ce n'est pas ton tour");
                     }
                  } else {
                     announce("<i class='ico pr-denied s-64'></i> La partie n'a pas commencée, tous les joueurs doivent avoir retourné deux cartes");
                  }
               }
            }
         }
      }
   });

   // CLICK CARD
   socket.on('click card', (player, position) => {

      for (r of rooms) {

         for (p of r.players) {

            if (player.roomId === r.id) {

               if (p.socketId === socket.id) {

                  // phase de retournement
                  if (!r.beginGame) {

                     if (r.lastTour === p.order) {

                        // on peut la retourner
                        // car le joueur qui clique est celui qui a le droit de jouer

                        if (!p.visible[position]) {

                           p.visible[position] = 1; // on dit que cette carte est visible
                           valeur = p.cartes[position]; // on récupère la valeur de la carte

                           p.points = parseInt(p.points) + parseInt(valeur); // on enregistre ses points

                           // on montre à tous les joueurs que la carte a été retournée
                           for (i = 0; i < r.players.length; i++) {
                              moongoRep.to(r.players[i].socketId).emit('retourner carte', p.order, position, valeur, p.points);
                           }

                           // on envoie un son
                           playSound("all", r.id, "card-flip-1");

                           r.tour++; // on ajoute un tour

                           // si on est à deux tour
                           if (r.tour >= 2) {

                              if (r.lastTour + 1 == r.players.length) {
                                 // on doit voir qui a le max 
                                 maxPoint = [];

                                 for (i = 0; i < r.players.length; i++) {
                                    maxPoint.push(r.players[i].points);
                                 }

                                 // on obtient l'index
                                 indexOfMaxValue = maxPoint.reduce((iMax, x, i, arr) => x > maxPoint[iMax] ? i : iMax, 0);

                                 // le dernier tour correspond à celui qui a le max
                                 r.lastTour = indexOfMaxValue

                                 // point ou points ?
                                 maxPoint[indexOfMaxValue] >= 2 ? pluri = "s" : pluri = "";

                                 moongoRep.to(r.id).emit('announce', `<i class='ico pr-info s-64'></i> ${r.players[r.lastTour].username} a le maximum avec ${maxPoint[indexOfMaxValue]} point${pluri}`);
                                 moongoRep.to(r.id).emit('announce', `C'est à ${r.players[r.lastTour].username} de jouer`);
                                 moongoRep.to(r.id).emit('tour suivant', r.lastTour);
                                 moongoRep.to(r.id).emit('game begin');

                                 // la game commence
                                 r.beginGame = true;
                                 break;
                              }

                              // c'est au joueur suivant de jouer
                              r.lastTour++;

                              // on réinitialise les tour
                              r.tour = 0;

                              // on prévient tous les joueurs que c'est au tour suivant
                              moongoRep.to(r.id).emit('announce', `C'est à ${r.players[r.lastTour].username} de jouer`);
                              moongoRep.to(r.id).emit('tour suivant', r.lastTour);

                           }
                        } else {
                           announce("<i class='ico pr-denied s-64'></i> La carte a déjà été retournée"); // ! contournement
                        }
                        break;
                     } else {
                        announce("<i class='ico pr-denied s-64'></i> Ce n'est pas ton tour");
                     }
                  }

                  // si la game débute
                  else {

                     // on clique sur une carte
                     if (r.lastTour == p.order) {

                        // vérifier si la defausse n'est pas vide
                        if (r.defausse.length > 0) {

                           // vérifier si la game est finie
                           if (!canPlay(r)) break;

                           // dans le cas où il remplace
                           valeur = p.cartes[position]; // on récupère la valeur de la carte à changer
                           valeurDef = r.defausse[0]; // on récupère la valeur de la defausse

                           r.defausse.splice(0, 1); // on retire de la defausse
                           r.defausse[0] = valeur; // on met dans la defausse l'ancienne carte

                           p.cartes[position] = valeurDef; // le jeux du joueur aura la nouvelle carte

                           // si la carte était déjà retournée
                           if (p.visible[position] == 1) {
                              p.points = parseInt(p.points) - parseInt(valeur); // on enregistre ses points
                              p.points = parseInt(p.points) + parseInt(valeurDef); // on enregistre ses points
                           }

                           // si elle ne l'était pas
                           else {
                              p.points = parseInt(p.points) + parseInt(valeurDef); // on enregistre ses points
                           }

                           // on dit que cette carte est visible
                           p.visible[position] = 1;

                           // vérifier si nous devons retirer une colonne
                           removedCol = false;

                           // si une colonne a été supprimée 
                           if (checkRemoveCol(position, p.order, valeurDef)) {

                              // on lui retire 3x les points
                              p.points = p.points - (3 * valeurDef);

                              // on envoie un son
                              playSound("all", r.id, "card-flip-2");

                              // on annonce à tout le monde qu'il a supprimé une colonne
                              moongoRep.to(r.id).emit('announce', `<i class='ico pr-warning s-64'></i> ${p.username} a retiré sa colonne de ${r.defausse[0]}`);
                              moongoRep.to(r.id).emit('update points', p.order, p.points);
                           }

                           // si on a pas eu de colonne supprimée
                           else {
                              // on montre à tous les joueurs que la carte a été retournée
                              moongoRep.to(r.id).emit('announce', `${p.username} a remplacé son ${valeur} par un ${valeurDef}`);
                              moongoRep.to(r.id).emit('replace card', p.order, position, valeurDef, valeur, p.points);

                              // on envoie un son 
                              playSound("all", r.id, "card-flip-1");
                           }

                           // vérifier si c'est le dernier tour pour ce joueur 
                           if (p.visible.every((val, i, arr) => val === arr[0]) && r.theEnd === false) {

                              // on prévient tous les joueurs que c'étais le dernier tour
                              moongoRep.to(r.id).emit('announce', `<i class='ico pr-warning s-64'></i> ${p.username} a retourné sa dernière carte`);
                              moongoRep.to(r.id).emit('last card');
                              r.theEnd = true
                              r.theEndWho = r.lastTour
                           }

                           // si c'est le dernier tour
                           if (r.theEnd) {

                              if (r.theEndWho == 0 && r.lastTour == r.players.length - 1) { // si c'est le premier qui finit
                                 r.finishRound = true
                              }
                              if (r.theEndWho == r.players.length - 1 && r.lastTour == r.theEndWho - 1) { // si c'est le dernier qui finit
                                 r.finishRound = true
                              }
                              if (r.lastTour == r.theEndWho - 1) { // si c'est le milieu qui finit
                                 r.finishRound = true
                              }

                              // la manche est finie
                              if (r.finishRound) {
                                 verifLastColumns();
                              }
                           }

                           // on passe au joueur suivant 
                           if (parseInt(r.lastTour) + 1 == r.players.length) {
                              r.lastTour = 0;
                           } else {
                              r.lastTour++;
                           }

                           // on dit à tout le monde de passer au tour suivant
                           moongoRep.to(r.id).emit('tour suivant', r.lastTour);

                           // on envoie un son au joueur qui doit jouer
                           moongoRep.to(r.players[r.lastTour].socketId).emit('play waiting');

                           atiltirer = false;
                        } else {
                           announce("<i class='ico pr-denied s-64'></i> La defausse est vide, tu dois piocher");
                        }
                     } else {
                        announce("<i class='ico pr-denied s-64'></i> Tu ne peux pas retourner cette carte"); // ! contournement
                     }
                  }
               }
            }
         }
      }
   });

   // DISCONNECT
   socket.on('disconnect', () => {

      // check if this user has host of any rooms
      rooms.forEach(r => {
         r.players.forEach(p => {

            let room = null;

            // si le socket.id qui s'est déconnecté était un host
            if (p.socketId === socket.id && p.host) {

               // ! on doit supprimer la room
               room = r;
               rooms = rooms.filter(r => r !== room);

               // on deconnecte les autres utilisateurs qui sont dans cette room
               moongoRep.to(r.id).emit('leave room', rooms);

               for (i = 0; i < r.players.length; i++) {
                  // moongoRep.to(r.players[i].socketId).emit('leave room', rooms);
                  utils.consoleLog("negative", `${r.players[i].socketId} ${r.players[i].username} left #${room.id}`);
               }

               sendClientRoomsData();

               utils.consoleLog("negative", `${socket.id} ${p.username} remove #${r.id}`);

               sendClientRoomsPlayersData();

               return;
            }

            // si le socket.id etait dans une partie
            if (p.socketId === socket.id && !p.host && p.roomId != "") {

               // retirer le joueur de la room
               index = r.players.indexOf(p);
               rooms.players = r.players.splice(index, 1);

               moongoRep.to(r.id).emit('announce', `${p.username} a quitté la partie !`);

               utils.consoleLog("negative", `${socket.id} ${p.username} left #${p.roomId}`);

               sendClientRoomsData();

               sendClientRoomsPlayersData()

               return;
            }
         });
      });
      utils.consoleLog("negative", `${socket.id}`);
   });

   function canPlay(r) {
      if (r.finishGame) {
         announce(`<i class='ico pr-denied s-64'></i> La partie est terminée`);
         return false;
      }
      else if (r.finishRound) {
         announce(`<i class='ico pr-denied s-64'></i> La manche est terminée`);
         return false;
      }
      else {
         return true;
      }
   }

   function announce(txt) {
      if (txt != "") moongoRep.to(socket.id).emit('announce', txt);
   }

   function sendClientRoomsData() {
      sendClient = [];
      rooms.forEach(r => {
         sendClientDArr = [];
         sendClientDArr.push(r.players.length, r.start, r.players[0].username, r.id);
         sendClient.push(sendClientDArr);
      });
      moongoRep.emit('update room', rooms.length, sendClient);
   }

   function sendClientRoomsPlayersData() {
      sendClient = [];
      rooms.forEach(r => {
         for (i = 0; i < r.players.length; i++) {
            sendClientDArr = [];
            sendClientDArr.push(r.id, r.players[i].host, r.players[i].username);
            sendClient.push(sendClientDArr);
         }
      });
      moongoRep.emit('update room players', sendClient);
   }

   function playSound(who, room_id, what) {
      if (who === "all") {
         moongoRep.to(room_id).emit('play sound', what)
      }
      if (who === "me") {
         moongoRep.to(socket.id).emit('play sound', what);
      }
      if (who === "notme") {
         rooms.forEach(r => {
            for (i = 0; i < r.players.length; i++) {
               if (socket.id != r.players[i].socketId) {
                  moongoRep.to(r.players[i].socketId).emit('play sound', what);
               }
            }
         });
      }
   }

   // game end
   function verifLastColumns() {

      // determiner si on doit retirer des colonnes
      for (nuJou = 0; nuJou < r.players.length; nuJou++) {

         for (nuCol = 0; nuCol < 4; nuCol++) {

            // si la carte de la première ligne == à celle de la ligne suivante et encore suivante 
            // ET que la valeur n'est pas zéro
            // ET que ca ne soit pas le joueur qui finit (pcq il a déjà tout retourné)
            if (r.players[nuJou].cartes[nuCol] == r.players[nuJou].cartes[nuCol + 4] &&
               r.players[nuJou].cartes[nuCol + 4] == r.players[nuJou].cartes[nuCol + 8] &&
               r.players[nuJou].cartes[nuCol] != 0 &&
               r.theEndWho != nuJou) {

               playSound("all", r.id, "card-flip-2");

               // on garde en mémoire la valeur de la carte
               temp = r.players[nuJou].cartes[nuCol];

               // on prévient tout le monde qu'on supprime une colonne
               for (i = 0; i < r.players.length; i++) {
                  moongoRep.to(r.players[i].socketId).emit('remove col', nuCol, nuJou, r.players[nuJou].cartes[nuCol], r.players[nuJou].nbCol);
                  moongoRep.to(r.players[i].socketId).emit('announce', `<i class='ico pr-warning s-64'></i> ${r.players[nuJou].username} a retiré sa colonne de ${r.players[nuJou].cartes[nuCol]}`);
                  moongoRep.to(r.players[i].socketId).emit('update points', r.players[nuJou].order, r.players[nuJou].points);
               }

               // on retire une colonne de la data du joueur
               r.players[nuJou].nbCol--;
            }
         }
      }

      // on rends toute les cartes visibles 
      for (i = 0; i < r.players.length; i++) {
         for (y = 0; y < 12; y++) {
            r.players[i].visible[y] = 1;
         }
      }

      // on indique que la valeur de ses cartes valent 0
      for (z = 0; z < r.players.length; z++) {
         for (y = 0; y < 4; y++) {
            if (r.players[z].cartes[y] == r.players[z].cartes[y + 4] &&
               r.players[z].cartes[y + 4] == r.players[z].cartes[y + 8] &&
               r.players[z].cartes[y] != 0 &&
               r.theEndWho != z) {

               r.players[z].cartes[y] = 0;
               r.players[z].cartes[y + 4] = 0;
               r.players[z].cartes[y + 8] = 0;
            }
         }
      }

      // on calcul les points globaux
      calculateGlobalPoints();

      // on affiche à nouveaux la valeur de ces cartes
      for (nuJou = 0; nuJou < r.players.length; nuJou++) {

         for (nbCol = 0; nbCol < 4; nbCol++) {
            if (r.players[nuJou].cartes[nuCol] == r.players[nuJou].cartes[nuCol + 4] &&
               r.players[nuJou].cartes[nuCol + 4] == r.players[nuJou].cartes[nuCol + 8] &&
               r.players[nuJou].cartes[nuCol] != 0 &&
               r.theEndWho != nuJou) {

               r.players[nuJou].cartes[nbCol] = temp;
               r.players[nuJou].cartes[nbCol + 4] = temp;
               r.players[nuJou].cartes[nbCol + 8] = temp;
            }
         }
      }

      // determine si c'est la fin de la partie 
      for (i = 0; i < r.players.length; i++) {
         if (r.players[i].pointGlobal >= MAX_POINT) {
            r.finishGame = true;
            break;
         }
      }

      // si la game n'est pas finie on est donc dans une manche
      if (!r.finishGame) {

         r.tourCount++;

         moongoRep.to(r.id).emit('announce', `<i class='ico pr-warning s-64'></i> ${p.username} a finit la manche !`);
         moongoRep.to(r.id).emit('game end', r.players, r.finishGame, r.tourCount);

         r.finishRound = true;
         return; // ? hallelujah
      }

      // si la game est totalement finie
      else {
         for (i = 0; i < r.players.length; i++) {
            if (r.players[i].pointGlobal >= MAX_POINT) {
               looser = r.players[i].username;
               looserPoints = r.players[i].pointGlobal;
               looserSocket = (r.players[i].socketId == socket.id) ? true : false;
            }
         }
         utils.consoleLog("info", `Looser : ${looser} - ${looserPoints} points`);

         r.tourCount++;

         if (looserSocket) playSound("me", r.id, "loose");

         moongoRep.to(r.id).emit('announce', `<i class='ico pr-poop s-64'></i> ${looser} a perdu avec ${looserPoints} points ! (bouuu)`);
         moongoRep.to(r.id).emit('game end', r.players, r.finishGame, r.tourCount);

         r.finishGame = true;
         return; // ? hallelujah
      }
   }

   function calculateGlobalPoints() {

      minArr = [];

      for (i = 0; i < r.players.length; i++) {

         r.players[i].points = 0;

         for (y = 0; y < r.players[i].cartes.length; y++) {
            r.players[i].points = parseInt(r.players[i].points) + parseInt(r.players[i].cartes[y]);
         }

         if (r.theEndWho != i) {
            minArr.push(r.players[i].points);
         }

         r.players[i].pointGlobal = r.players[i].pointGlobal + r.players[i].points;
      }

      // doubler les points si le joueur à moins que le minimum
      min = Math.min(...minArr);

      if (min <= r.players[r.theEndWho].points && r.players[r.theEndWho].points > 0) {
         r.players[r.theEndWho].pointGlobal = r.players[r.theEndWho].pointGlobal + r.players[r.theEndWho].points;
         moongoRep.to(r.id).emit('announce', `${r.players[r.theEndWho].username} a doublé ses points car il n'avait pas le minimum ! (aïe)`)
      }
   }

   function createRoom(player) {
      // on définit la room
      var room = {
         id: utils.roomId(),        // génération de l'id
         start: false,        // room lancé ou non
         players: [],         // liste des joueurs
         jeux: [],            // cartes du jeux
         defausse: [],        // cartes de la defausse
         lastTour: 0,         // qui joue le dernier tour 
         beginGame: false,    // a t on finit de retourner
         theEnd: false,       // game finie ?
         theEndWho: false,    // qui a finit
         finish: false,       // qui a finit
         tour: 0,             // nombre de tour
         tourCount: 0
      };
      // création jeux de carte 
      createGameCards(room);

      player.host = true;
      player.username = utils.newStringCharacter(player.username);
      player.retourPoint = 0;
      player.order = 0;
      player.roomId = room.id;

      room.players.push(player);
      rooms.push(room);

      utils.consoleLog("info", `${socket.id} has created Moongo room #${room.id}`);

      return room;
   }
   function createGameCards(room) {
      for (i = 0; i < 5; i++) {
         room.jeux.push("-4");
         room.jeux.push("-2");
      }

      for (i = 0; i < 15; i++) { // 15
         room.jeux.push("0");
      }

      for (i = 0; i < 10; i++) { // 10
         room.jeux.push("-1");
         room.jeux.push("1");
         room.jeux.push("2");
         room.jeux.push("3");
         room.jeux.push("4");
         room.jeux.push("5");
         room.jeux.push("6");
         room.jeux.push("7");
         room.jeux.push("8");
         room.jeux.push("9");
         room.jeux.push("10");
         room.jeux.push("11");
         room.jeux.push("12");
      }
      utils.shuffleArray(room.jeux);
      return room.jeux;
   }

   function checkRemoveCol(position, z, valeurDef) {
      // premiere rangé 
      if (position < 4) {
         if (r.players[z].visible[position + 4] == 1 && r.players[z].visible[position + 8] == 1) {
            if (r.players[z].cartes[position + 4] == valeurDef && r.players[z].cartes[position + 8] == valeurDef) {

               // suprimer la colonne
               // on récupère le nombre de colonne
               nb_col = r.players[z].nbCol;

               for (i = 0; i < r.players.length; i++) {
                  moongoRep.to(r.players[i].socketId).emit('remove col', position, r.lastTour, r.players[z].cartes[position + 4], r.players[z].nbCol);
               }

               // ajouter les trois cartes à la defausse
               // on ajoute celle qu'il a retourné 
               r.defausse.unshift(r.players[z].cartes[position]);

               // puis on ajoute les deux autres
               for (i = 0; i < 2; i++) {
                  r.defausse.unshift(r.players[z].cartes[position + 4]);
               }

               for (y = 0; y < 3; y++) {
                  // la valeur dans son jeux 0
                  r.players[z].cartes[position] = "0";

                  // de même pour les 4 suivantes
                  position = position + 4
               }

               r.players[z].nbCol--;
               return true;
            }
         }
      }
      // deuxieme rangé
      else if (position < 8) {
         if (r.players[z].visible[position + 4] == 1 && r.players[z].visible[position - 4] == 1) {
            if (r.players[z].cartes[position + 4] == valeurDef && r.players[z].cartes[position - 4] == valeurDef) {

               // suprimer la colonne
               // on récupère le nombre de colonne
               nb_col = r.players[z].nbCol;

               // on retire les 4 derniers caractères 5 0 p x 
               for (i = 0; i < r.players.length; i++) {
                  moongoRep.to(r.players[i].socketId).emit('remove col', position, r.lastTour, r.players[z].cartes[position + 4], r.players[z].nbCol);
               }

               // on ajoute celle qu'il a retourné puis les deux autres
               r.defausse.unshift(r.players[z].cartes[position]);
               r.defausse.unshift(r.players[z].cartes[position + 4]);
               r.defausse.unshift(r.players[z].cartes[position - 4]);

               r.players[z].cartes[position] = "0";
               r.players[z].cartes[position - 4] = "0";
               r.players[z].cartes[position + 4] = "0";

               r.players[z].nbCol--;

               return true;
            }
         }
      }
      // troisieme rangé
      else {
         if (r.players[z].visible[position - 4] == 1 && r.players[z].visible[position - 8] == 1) {
            if (r.players[z].cartes[position - 4] == valeurDef && r.players[z].cartes[position - 8] == valeurDef) {

               // suprimer la colonne
               // on récupère le nombre de colonne
               nb_col = r.players[z].nbCol;

               // on retire les 4 derniers caractères 5 0 p x 
               for (i = 0; i < r.players.length; i++) {
                  moongoRep.to(r.players[i].socketId).emit('remove col', position, r.lastTour, r.players[z].cartes[position - 4], r.players[z].nbCol);
               }

               // on ajoute celle qu'il a retourné 
               r.defausse.unshift(r.players[z].cartes[position]);

               // puis on ajoute les deux autres
               for (i = 0; i < 2; i++) {
                  r.defausse.unshift(r.players[z].cartes[position - 4]);
               }

               for (y = 0; y < 3; y++) {

                  // la valeur dans son jeux 0
                  r.players[z].cartes[position] = "0";

                  // de même pour les 4 suivantes
                  position = position - 4
               }
               r.players[z].nbCol--;
               return true;
            }
         }
      }
   }
}