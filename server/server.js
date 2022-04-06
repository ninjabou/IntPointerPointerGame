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
                field: []
            });
            
            populate_deck(data.code);

            io.sockets.in(games[game_index].game_code).emit("join_success", {num: games[game_index].players.length - 1, game: games[game_index].game_code});
            socket.emit("server_message", {data: "Player joined existing game."});
        } else {
            // Create new game with no current winner.
            games.push({
                game_code: data.code,
                win_state: -1,
                current_player: 0,
                phase: "play",
                players: [],
                deck: []
            });

            socket.emit("server_message", {data: "Player created new game."});

            // The game was created, so try again to add the player.
            handle_join_game(data);
        }
    }

    socket.on("turn_taken", handle_turn_taken);
    function handle_turn_taken(data){
        let game_index = games.findIndex(e => e.game_code === data.game_code);
        if(game_index >= 0){
            switch(data.phase){
                case "play":
                    // handle play
                    // change phase to trigger
                    break;
                case "trigger":
                    // handle trigger
                    // change phase to play
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
    }
}