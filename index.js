const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });

let player_number = undefined;
let game_code = undefined;
let hand = undefined;
let field = undefined;
let your_play = false;
let your_trigger = false;

// Thanks to mplungjan at https://stackoverflow.com/questions/5384712/intercept-a-form-submit-in-javascript-and-prevent-normal-submission
window.addEventListener("load", function() {
    document.getElementById("login-form").addEventListener("submit", function(e) {
        e.preventDefault(); // before the code
        let code = document.getElementById("room-code").value;
        let name = document.getElementById("player-name").value;
        if(code !== "" && name !== ""){
            socket.emit("subscribe", {room: code});
            socket.emit("join_game", {name: name, code: code});
        }
    })
});

socket.on("join_success", handle_join_success);
function handle_join_success(data){
    if(player_number == undefined && game_code == undefined){
        player_number = data.num;
        game_code = data.game;
        hand = data.hand;
        field = data.field;
        document.getElementById("code-display").innerHTML = game_code;
        document.getElementById("name-display").innerHTML = document.getElementById("player-name").value;
        document.getElementById("login-modal").remove();
        update_hand();
        if(player_number == 0){
            socket.emit("begin_game", {game_code: game_code});
        }
    }
}

function update_hand(){
    for(let i = 0; i < 3; i++){
        if(hand[i] != undefined){
            document.getElementById("hand" + i + "-label").style.visibility = "visible";
            document.getElementById("hand" + i).style.visibility = "visible";
            document.getElementById("hand" + i + "-label").innerHTML = hand[i].suit + ", " + hand[i].value;
        } else {
            document.getElementById("hand" + i + "-label").style.visibility = "hidden";
            document.getElementById("hand" + i).style.visibility = "hidden";
        }
    }
}

socket.on("play", handle_play);
function handle_play(data){
    hand = data.players[player_number].hand;
    field = data.players[player_number].field;
    update_hand();
    if(data.player == player_number){
        your_play = true;
    }
}
window.addEventListener("load", function() {
    document.getElementById("hand-form").addEventListener("submit", function(e) {
        e.preventDefault(); // before the code
        let cardcheck = document.querySelector('input[name="hand"]:checked');
        if(cardcheck != null && your_play == true){
            socket.emit("turn_taken", {game_code: game_code, card: hand[cardcheck.value]});
            your_play = false;
        }
    })
});

socket.on("trigger", handle_trigger);
function handle_trigger(data){
    hand = data.players[player_number].hand;
    console.log(hand);
    field = data.players[player_number].field;
    update_hand();
    if(data.player != player_number){
        your_trigger = true;
    } else {
        socket.emit("turn_taken", {game_code: game_code, card: null});
        return;
    }
    if(field.length == 0){
        socket.emit("turn_taken", {game_code: game_code, card: null});
        return;
    }
    // handle math
}

socket.on("server_message", handle_server_message);
function handle_server_message(msg){
    console.log(msg);
}