const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = require('express')()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


const io = require('socket.io')(server);


let players = [];
let playedCards = 0;

let deck=[
    'a2','a3','a4','a5','a6','a7','a8','a9','a10','a11','a12','a13', 'a14',
    'b2','b3','b4','b5','b6','b7','b8','b9','b10','b11','b12','b13', 'b14',
    'c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13', 'c14',
    'd2','d3','d4','d5','d6','d7','d8','d9','d10','d11','d12','d13', 'd14',
];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

      [array[i], array[j]] = [array[j], array[i]];
    }
  }

 
io.on('connection', function (socket) {
    locplayerNo = players.length +1;

    io.to(socket.id).emit('PlayerNo', locplayerNo);
    
    playerJoin = "Player " + locplayerNo + " connected: " + socket.id;
    console.log(playerJoin);

    players.push(socket.id);

    socket.emit('playerJoined', players.length);


    socket.on('dealCards', function () {

        shuffle (deck);

        for (let i = 0; i < players.length; i++) {
            playerCards = []

            cards = " ";
            for (let j =0; j < 13; j++)
            {
                var cardid = deck.pop();
                playerCards.push(cardid);
                cards += cardid + ",";
            }
            playerCards.sort();
            io.to(players[i]).emit('showCards', playerCards);
            console.log("Player " + (i+1) + cards )
        }

    });

    socket.on('claimTrick', function(playerNo){
        console.log("Player " + playerNo + " claimed a trick ");
        io.emit('clearZone');
    })



    socket.on('cardPlayed', function (gameObject, playerNo) {
        io.emit('cardPlayed', gameObject, playerNo);
        console.log("Player " + playerNo + " played a card ");
        playedCards ++;

        if (playedCards >= 4)
        {
            io.emit('openClaim');
            playedCards = 0;
        }


    });

    socket.on('disconnect', function () {
        console.log("Player " + locplayerNo + " disconnected: " + socket.id);
        players = players.filter(player => player !== socket.id);
    });
});



setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

