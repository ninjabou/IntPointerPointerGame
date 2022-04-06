const io = require('socket.io')();

let games = [];

io.on("connection", client => {
    client.emit("server_message", {data: "hello world"});

    client.on("join_game", handle_join_game);
    function handle_join_game(data){
        let game = games.filter(e => e.game_code === data.code);
        if(game.length > 0){
            // Add player to existing game.
            game[0].players.push({
                name: data.name,
                hand: []
            });

            client.emit("join_success", {num: game[0].players.length - 1, game: game[0].game_code});
            client.emit("server_message", {data: "Player joined existing game."});
        } else {
            // Create new game with no current winner.
            games.push({
                game_code: data.code,
                win_state: -1,
                players: [],
                deck: []
            });

            client.emit("server_message", {data: "Player created new game."});

            // The game was created, so try again to add the player.
            handle_join_game(data);
        }

    }
});

io.listen(3000);