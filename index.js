const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });

let player_number;
let game_code;

// Thanks to mplungjan at https://stackoverflow.com/questions/5384712/intercept-a-form-submit-in-javascript-and-prevent-normal-submission
window.addEventListener("load", function() {
    document.getElementById("login-form").addEventListener("submit", function(e) {
        e.preventDefault(); // before the code
        let code = document.getElementById("room-code").value;
        let name = document.getElementById("player-name").value;
        if(code !== "" && name !== ""){
            socket.emit("join_game", {name: name, code: code});
        }
    })
});

socket.on("join_success", handle_join_success);
function handle_join_success(data){
    player_number = data.num;
    game_code = data.game;
    document.getElementById("code-display").innerHTML = game_code;
    document.getElementById("name-display").innerHTML = document.getElementById("player-name").value;
    document.getElementById("login-modal").remove();
}

socket.on("turn", handle_turn);
function handle_turn(data){
    if(data.player == player_number){
        // Take turn, then emit turn finished.
    }
    // Not your turn!
}

socket.on("trigger", handle_trigger);
function handle_trigger(data){
    // Handle trigger. only for spades.
    // data should contain the number on the spades card.
}

socket.on("steal", handle_steal);
function handle_steal(data){
    if(data.player == player_number){
        // Handle steal. only for clubs.
    }
    // You're not being stolen from!
}

socket.on("server_message", handle_server_message);
function handle_server_message(msg){
    console.log(msg);
}