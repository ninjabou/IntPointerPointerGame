const io = require('socket.io')();

let games = [];

io.sockets.on("connection", socket => {
    socket.on("join_game", handle_join_game);
    function handle_join_game(data){
        // let game = games.filter(e => e.game_code === data.code);
        let game_index = games.findIndex(e => e.game_code === data.code);
        if(game_index >= 0){
            // Add player to existing game.
            games[game_index].players.push({
                name: data.name,
                hand: [],
                field: [],
                points: 0,
                card_to_lose: null
            });
            
            populate_deck(data.code);

            io.sockets.in(games[game_index].game_code).emit("join_success", {
                num: games[game_index].players.length - 1,
                game: games[game_index].game_code,
                hand: games[game_index].players[games[game_index].players.length - 1].hand,
                field: games[game_index].players[games[game_index].players.length - 1].field,
                players: games[game_index].players
            });
            socket.emit("server_message", {data: "Player joined existing game."});
        } else {
            // Create new game with no current winner.
            games.push({
                game_code: data.code,
                win_state: -1,
                current_player: 0,
                phase: "play",
                players: [],
                deck: [],
                waiting_for: 0
            });

            socket.emit("server_message", {data: "Player created new game."});

            // The game was created, so try again to add the player.
            handle_join_game(data);
        }
    }

    socket.on("begin_game", handle_begin_game);
    function handle_begin_game(data){
        let game_index = games.findIndex(e => e.game_code === data.game_code);
        if(game_index >= 0){
            draw_card(games[game_index].game_code);
            io.sockets.in(games[game_index].game_code).emit("play", {player: games[game_index].current_player, players: games[game_index].players});
        }
    }

    socket.on("turn_taken", handle_turn_taken);
    function handle_turn_taken(data){
        let game_index = games.findIndex(e => e.game_code === data.game_code);
        if(game_index >= 0){
            switch(games[game_index].phase){
                case "play":
                    let target = -1;
                    switch(data.card.suit){
                        case "diamonds":
                            games[game_index].players[games[game_index].current_player].points++;
                            break;
                        case "spades":
                            games[game_index].players[games[game_index].current_player].field.push(data.card);
                            break;
                        case "hearts":
                            games[game_index].players[games[game_index].current_player].field.push(data.card);
                            break;
                        case "clubs":
                            games[game_index].players[data.target_player].card_to_lose = data.target_card;
                            target = data.target_player;
                            break;
                    }

                    games[game_index].players[games[game_index].current_player].hand.splice(
                        games[game_index].players[games[game_index].current_player].hand.findIndex(e => e.suit === data.card.suit && e.value === data.card.value), 1);

                    games[game_index].phase = "trigger";
                    games[game_index].waiting_for = games[game_index].players.length;
                    io.sockets.in(games[game_index].game_code).emit("trigger", {
                        player: games[game_index].current_player,
                        players: games[game_index].players,
                        card: data.card,
                        target: target,
                        target_card: data.target_card
                    });
                    break;
                case "trigger":
                    if(data.card != null){
                        if(data.card.suit === "spades"){
                            games[game_index].players[data.player].points += 2;
                            games[game_index].players[data.player].hand.splice(
                                games[game_index].players[data.player].hand.findIndex(e => e.suit === data.card.suit && e.value === data.card.value), 1);
                        }
                        if(data.card.suit === "hearts"){
                            games[game_index].players[data.player].hand.splice(
                                games[game_index].players[data.player].hand.findIndex(e => e.suit === data.card.suit && e.value === data.card.value), 1);
                            games[game_index].players[data.player].card_to_lose = null;
                        } 
                    } else {
                        if(games[game_index].players[data.player].card_to_lose != null){
                            let card_loser = games[game_index].players[data.player];
                            card_loser.hand.splice(
                                card_loser.hand.findIndex(e => e.suit === card_loser.card_to_lose.suit && e.value === card_loser.card_to_lose.value), 1);
                            games[game_index].players[data.player].card_to_lose = null;
                        }
                    }
                
                    games[game_index].waiting_for--;
                    if(games[game_index].waiting_for <= 0){
                        games[game_index].phase = "play";
                        games[game_index].current_player = (games[game_index].current_player + 1) % games[game_index].players.length;
                        draw_card(games[game_index].game_code);
                        io.sockets.in(games[game_index].game_code).emit("play", {
                            player: games[game_index].current_player,
                            players: games[game_index].players
                        });
                    }
                    break;
            }
        }
    }

    socket.on("subscribe", function(data){ socket.join(data.room); });

    socket.on("unsubscribe", function(data){ socket.leave(data.room); });
});

io.listen(3000);

function populate_deck(game_code){
    let game_index = games.findIndex(e => e.game_code === game_code);
    if(game_index >= 0){
        games[game_index].deck.push({
            suit: "diamonds",
            value: 5
        }, {
            suit: "hearts",
            value: 5
        }, {
            suit: "spades",
            value: 5
        }, {
            suit: "clubs",
            value: 5
        });
        for(let i = 0; i < 2; i++){
            games[game_index].deck.push({
                suit: "diamonds",
                value: 4
            }, {
                suit: "hearts",
                value: 4
            }, {
                suit: "spades",
                value: 4
            }, {
                suit: "clubs",
                value: 4
            });
            games[game_index].deck.push({
                suit: "diamonds",
                value: 3
            }, {
                suit: "hearts",
                value: 3
            }, {
                suit: "spades",
                value: 3
            }, {
                suit: "clubs",
                value: 3
            });
            games[game_index].deck.push({
                suit: "diamonds",
                value: 2
            }, {
                suit: "hearts",
                value: 2
            }, {
                suit: "spades",
                value: 2
            }, {
                suit: "clubs",
                value: 2
            });
        }
        for(let i = 0; i < 3; i++){
            games[game_index].deck.push({
                suit: "diamonds",
                value: 1
            }, {
                suit: "hearts",
                value: 1
            }, {
                suit: "spades",
                value: 1
            }, {
                suit: "clubs",
                value: 1
            });
        }

        // Deal 2 cards to new player.
        for(let i = 0; i < 2; i++){
            games[game_index].players[games[game_index].players.length - 1].hand.push(
                games[game_index].deck.splice(Math.floor(Math.random() * games[game_index].deck.length), 1)[0]
            );
        }
    }
}

function draw_card(game_code){
    let game_index = games.findIndex(e => e.game_code === game_code);
    if(game_index >= 0){
        let removed_card = games[game_index].deck.splice(Math.floor(Math.random() * games[game_index].deck.length), 1)[0];
        games[game_index].players[games[game_index].current_player].hand.push(removed_card);
    }
}