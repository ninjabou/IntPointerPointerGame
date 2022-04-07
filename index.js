const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });

let player_number = undefined;
let game_code = undefined;
let hand = undefined;
let field = undefined;
let incoming_card = undefined;
let players = [];
let your_play = false;
let your_trigger = false;

// Thanks to mplungjan at https://stackoverflow.com/questions/5384712/intercept-a-form-submit-in-javascript-and-prevent-normal-submission
window.addEventListener("load", function() {
    document.getElementById("player-info").style.visibility = "hidden";

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
        update();
        document.getElementById("code-display").innerHTML = game_code;
        document.getElementById("name-display").innerHTML = document.getElementById("player-name").value;
        document.getElementById("player-info").style.visibility = "visible";
        document.getElementById("login-modal").remove();
        if(player_number == 0){
            socket.emit("begin_game", {game_code: game_code});
        }
    }
}

socket.on("play", handle_play);
function handle_play(data){
    hand = data.players[player_number].hand;
    field = data.players[player_number].field;
    players = data.players;
    update();
    if(data.player == player_number){
        your_play = true;
    }
}
window.addEventListener("load", function() {
    document.getElementById("hand-form").addEventListener("submit", function(e) {
        e.preventDefault(); // before the code
        let cardcheck = document.querySelector('input[name="hand"]:checked');
        let targetcheck = null;
        let target_index = null;
        for(let i = 0; i < players.length; i++){
            if(i != player_number && targetcheck == null){
                targetcheck = document.querySelector('input[name="opponent-field' + i + '"]:checked');
                target_index = i;
            }
        }
        if(cardcheck != null && targetcheck != null && your_play == true){
            socket.emit("turn_taken", {game_code: game_code, card: hand[cardcheck.value], target: players[target_index].field[targetcheck.value]});
            your_play = false;
        }
    })
});

socket.on("trigger", handle_trigger);
function handle_trigger(data){
    hand = data.players[player_number].hand;
    field = data.players[player_number].field;
    players = data.players;
    incoming_card = data.card;
    update();
    if(data.player != player_number){
        your_trigger = true;
    } else {
        socket.emit("turn_taken", {game_code: game_code, card: null});
        your_trigger = false;
        return;
    }
    if(field.length == 0){
        socket.emit("turn_taken", {game_code: game_code, card: null});
        your_trigger = false;
        return;
    }
    if(incoming_card.suit === "hearts" || incoming_card.suit === "spades"){
        socket.emit("turn_taken", {game_code: game_code, card: null});
        your_trigger = false;
        return;
    }
}
window.addEventListener("load", function() {
    document.getElementById("field-form").addEventListener("submit", function(e) {
        e.preventDefault(); // before the code
        let cardcheck = document.querySelector('input[name="field"]:checked');
        if(cardcheck != null && your_trigger == true){
            if(incoming_card.suit === "diamonds" && field[cardcheck.value].suit === "spades"){
                if(field[cardcheck.value].value > incoming_card.value){
                    socket.emit("turn_taken", {game_code: game_code, card: field[cardcheck.value]});
                    your_trigger = false;
                } else {
                    socket.emit("turn_taken", {game_code: game_code, card: null});
                    your_trigger = false;
                }
            } else if(incoming_card.suit === "clubs" && field[cardcheck.value].suit === "hearts"){
                if(field[cardcheck.value].value > incoming_card.value){
                    socket.emit("turn_taken", {game_code: game_code, card: field[cardcheck.value]});
                    your_trigger = false;
                } else {
                    socket.emit("turn_taken", {game_code: game_code, card: null});
                    your_trigger = false;
                }
            } else {
                socket.emit("turn_taken", {game_code: game_code, card: null});
                your_trigger = false;
            }
        }
        if(cardcheck == null && your_trigger == true){
            socket.emit("turn_taken", {game_code: game_code, card: null});
            your_trigger = false;
        }
    })
});

socket.on("server_message", handle_server_message);
function handle_server_message(msg){
    console.log(msg);
}

function update(){
    update_hand();
    update_field();
    update_points();
    update_opponents();
}
function update_points(){
    // document.getElementById("points-display").innerHTML = "" + players[player_number].points;
}
function update_opponents(){
    let current_names = document.querySelectorAll("#opponent-container > p");
    for(let i = 0; i < current_names.length; i++){
        current_names[i].remove();
    }
    let current_radios = document.querySelectorAll("#opponent-container > form > input[type=radio]");
    for(let i = 0; i < current_radios.length; i++){
        current_radios[i].remove();
    }
    let current_labels = document.querySelectorAll("#opponent-container > form > label");
    for(let i = 0; i < current_labels.length; i++){
        current_labels[i].remove();
    }

    for(let i = 0; i < players.length; i++){
        if(i != player_number){
            let new_name = document.createElement("p");
            new_name.innerHTML = players[i].name + ": ";
            document.getElementById("opponent-container").appendChild(new_name);

            let new_form = document.createElement("form");
            new_form.setAttribute("id", "opponent-form" + i);

            for(let j = 0; j < players[i].field.length; j++){
                let new_radio = document.createElement("input");
                new_radio.setAttribute("type", "radio");
                new_radio.setAttribute("id", "opponent-field" + i + ":" + j);
                new_radio.setAttribute("name", "opponent-field" + i);
                new_radio.setAttribute("value", "" + j);
                let new_label = document.createElement("label");
                new_label.setAttribute("for", "opponent-field" + i + ":" + j);
                new_label.setAttribute("id", "opponent-field" + i + ":" + j + "-label");
                new_label.innerHTML = players[i].field[j].suit + ", " + players[i].field[j].value;
                new_form.appendChild(new_radio);
                new_form.appendChild(new_label);
            }
            document.getElementById("opponent-container").appendChild(new_form);
        }
    }
}
function update_hand(){
    let current_radios = document.querySelectorAll("#hand-form > input[type=radio]");
    for(let i = 0; i < current_radios.length; i++){
        current_radios[i].remove();
    }
    let current_labels = document.querySelectorAll("#hand-form > label");
    for(let i = 0; i < current_labels.length; i++){
        current_labels[i].remove();
    }

    for(let i = 0; i < hand.length; i++){
        let form = document.getElementById("hand-form");
        let new_radio = document.createElement("input");
        new_radio.setAttribute("type", "radio");
        new_radio.setAttribute("id", "hand" + i);
        new_radio.setAttribute("name", "hand");
        new_radio.setAttribute("value", "" + i);
        let new_label = document.createElement("label");
        new_label.setAttribute("for", "hand" + i);
        new_label.setAttribute("id", "hand" + i + "-label");
        new_label.innerHTML = hand[i].suit + ", " + hand[i].value;
        form.insertBefore(new_radio, form.children[form.children.length - 1]);
        form.insertBefore(new_label, form.children[form.children.length - 1]);
    }
}
function update_field(){
    let current_radios = document.querySelectorAll("#field-form > input[type=radio]");
    for(let i = 0; i < current_radios.length; i++){
        current_radios[i].remove();
    }
    let current_labels = document.querySelectorAll("#field-form > label");
    for(let i = 0; i < current_labels.length; i++){
        current_labels[i].remove();
    }
    for(let i = 0; i < field.length; i++){
        let form = document.getElementById("field-form");
        let new_radio = document.createElement("input");
        new_radio.setAttribute("type", "radio");
        new_radio.setAttribute("id", "field" + i);
        new_radio.setAttribute("name", "field");
        new_radio.setAttribute("value", "" + i);
        let new_label = document.createElement("label");
        new_label.setAttribute("for", "field" + i);
        new_label.setAttribute("id", "field" + i + "-label");
        new_label.innerHTML = field[i].suit + ", " + field[i].value;
        form.insertBefore(new_radio, form.children[form.children.length - 1]);
        form.insertBefore(new_label, form.children[form.children.length - 1]);
    }
}