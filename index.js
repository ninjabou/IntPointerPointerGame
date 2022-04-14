const socket = io('https://hidden-cove-62945.herokuapp.com/', { transports: ['websocket', 'polling', 'flashsocket'] });

let this_player = undefined;
let game = undefined;
let your_play = false;
let your_trigger = false;
let you_are_targeted = false;

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
    game = data.game;
    if(this_player == undefined){
        this_player = data.num;
        document.getElementById("code-display").innerHTML = game.game_code;
        document.getElementById("name-display").innerHTML = game.players[this_player].name;
        document.getElementById("player-info").style.visibility = "visible";
        document.getElementById("login-modal").remove();
        if(this_player == 0){
            socket.emit("begin_game", {game_code: game.game_code});
        }
    }
    update();
}

socket.on("play", handle_play);
function handle_play(data){
    game = data.game;
    update();
    if(game.current_player == this_player){
        console.log("my play! " + this_player);
        your_play = true;
    }
}
window.addEventListener("load", function() {
    document.getElementById("hand-form").addEventListener("submit", function(e) {
        e.preventDefault(); // before the code
        let cardcheck = document.querySelector('input[name="hand"]:checked');
        let targetcheck = null;
        let target_index = null;
        for(let i = 0; i < game.players.length; i++){
            if(i != this_player && targetcheck == null){
                targetcheck = document.querySelector('input[name="opponent-field' + i + '"]:checked');
                target_index = i;
            }
        }
        if(cardcheck != null && your_play == true && game.players[this_player].hand[cardcheck.value].suit === "clubs"){
            if(targetcheck != null){
                socket.emit("turn_taken", {game_code: game.game_code, card: game.players[this_player].hand[cardcheck.value], target_card: targetcheck.value, target_player: target_index});
                your_play = false;
            } else {
                socket.emit("turn_taken", {game_code: game.game_code, card: game.players[this_player].hand[cardcheck.value], target_card: null, target_player: null});
                your_play = false;
            }
        } else if(cardcheck != null && your_play == true && game.players[this_player].hand[cardcheck.value].suit !== "clubs"){
            socket.emit("turn_taken", {game_code: game.game_code, card: game.players[this_player].hand[cardcheck.value], target_card: null, target_player: null});
            your_play = false;
        }
    })
});

socket.on("trigger", handle_trigger);
function handle_trigger(data){
    game = data.game;
    update();
    if(game.current_player != this_player){
        console.log("my trigger! " + this_player);
        your_trigger = true;
        if(game.target_player == this_player){
            you_are_targeted = true;
        }
    } else {
        socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
        your_trigger = false;
        you_are_targeted = false;
        return;
    }
    if(game.players[this_player].field.length == 0){
        socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
        your_trigger = false;
        you_are_targeted = false;
        return;
    }
    let num_hearts = 0;
    for(let i = 0; i < game.players[this_player].field.length; i++){
        if(game.players[this_player].field[i].suit === "hearts"){
            num_hearts++;
        }
    }
    if(game.last_card_played.suit === "clubs" && num_hearts <= 1 && game.target_player == this_player){
        socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
        your_trigger = false;
        you_are_targeted = false;
        return;
    }
    let num_spades = 0;
    for(let i = 0; i < game.players[this_player].field.length; i++){
        if(game.players[this_player].field[i].suit === "spades"){
            num_spades++;
        }
    }
    if(game.last_card_played.suit === "diamonds" && num_spades <= 0){
        socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
        your_trigger = false;
        you_are_targeted = false;
        return;
    }
    if(game.last_card_played.suit === "hearts" || game.last_card_played.suit === "spades"){
        socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
        your_trigger = false;
        you_are_targeted = false;
        return;
    }
}
window.addEventListener("load", function() {
    document.getElementById("field-form").addEventListener("submit", function(e) {
        e.preventDefault(); // before the code
        let cardcheck = document.querySelector('input[name="field"]:checked');
        if(cardcheck != null && your_trigger == true){
            if(game.last_card_played.suit === "diamonds" && game.players[this_player].field[cardcheck.value].suit === "spades"){
                if(game.players[this_player].field[cardcheck.value].value > game.last_card_played.value){
                    socket.emit("turn_taken", {game_code: game.game_code, card: game.players[this_player].field[cardcheck.value], player: this_player});
                    your_trigger = false;
                    you_are_targeted = false;
                    return;
                } else {
                    socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
                    your_trigger = false;
                    you_are_targeted = false;
                    return;
                }
            } else if(game.last_card_played.suit === "clubs" && game.players[this_player].field[cardcheck.value].suit === "hearts" && you_are_targeted){
                if(game.players[this_player].field[cardcheck.value].value > game.last_card_played.value){
                    socket.emit("turn_taken", {game_code: game.game_code, card: game.players[this_player].field[cardcheck.value], player: this_player});
                    your_trigger = false;
                    you_are_targeted = false;
                    return;
                } else {
                    socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
                    your_trigger = false;
                    you_are_targeted = false;
                    return;
                }
            } else {
                socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
                your_trigger = false;
                you_are_targeted = false;
                return;
            }
        }
        if(cardcheck == null && your_trigger == true){
            socket.emit("turn_taken", {game_code: game.game_code, card: null, player: this_player});
            your_trigger = false;
            you_are_targeted = false;
            return;
        }
    })
});

socket.on("server_message", handle_server_message);
function handle_server_message(msg){
    console.log(msg);
}

socket.on("game_over", handle_game_over);
function handle_game_over(data){
    game = data.game;

    let new_gameovertext = document.createElement("p");
    new_gameovertext.innerHTML = "Game Over! Winner(s) below: <br>";
    for(let i = 0; i < game.winners.length; i++){
        new_gameovertext.innerHTML = new_gameovertext.innerHTML + game.winners[i].name + " ";
    }
    document.getElementById("game-over").appendChild(new_gameovertext);
    document.getElementById("game-over").style.display = "flex";
}

function update(){
    update_hand();
    update_field();
    update_points();
    update_opponents();
    update_last_played();

    if(game.phase === "play" && game.current_player == this_player){
        document.getElementById("hand-form").style.backgroundColor = "#cfcfcf";
        document.getElementById("hand-form").style.boxShadow = "0 0 10px 10px #cfcfcf";
    } else {
        document.getElementById("hand-form").style.backgroundColor = null;
        document.getElementById("hand-form").style.boxShadow = null;
    }
    if(game.phase === "trigger" && game.current_player == this_player){
        document.getElementById("field-form").style.backgroundColor = "#cfcfcf";
        document.getElementById("field-form").style.boxShadow = "0 0 10px 10px #cfcfcf";
    } else {
        document.getElementById("field-form").style.backgroundColor = null;
        document.getElementById("field-form").style.boxShadow = null;
    }
}
function update_last_played(){
    let e = document.querySelector("#last-played-card > div");
    if(e != null){
        e.remove();
    }
    if(game.phase === "trigger"){
        let new_container = document.createElement("div");
        new_container.style.pointerEvents = "none";
        new_container.style.position = "relative";

        let new_radio = document.createElement("input");
        new_radio.setAttribute("type", "radio");
        new_radio.style.pointerEvents = "none";
        new_radio.style.borderColor = "red";
        new_radio.style.borderWidth = "5px";
        new_container.appendChild(new_radio);

        let new_suit = document.createElement("p");
        switch(game.last_card_played.suit){
            case "clubs":
                new_suit.innerHTML = "♣";
                new_suit.style.color = "black";
                break;
            case "diamonds":
                new_suit.innerHTML = "♦";
                new_suit.style.color = "red";
                break;
            case "hearts":
                new_suit.innerHTML = "♥";
                new_suit.style.color = "red";
                break;
            case "spades":
                new_suit.innerHTML = "♠";
                new_suit.style.color = "black";
                break;
        }
        new_suit.style.position = "absolute";
        new_suit.style.fontSize = "35px";
        new_suit.style.top = "-15px";
        new_suit.style.left = "28px";
        new_suit.style.pointerEvents = "none";
        new_container.appendChild(new_suit);

        let new_value = document.createElement("p");
        new_value.innerHTML = game.last_card_played.value;
        new_value.style.position = "absolute";
        new_value.style.fontSize = "50px";
        new_value.style.bottom = "-30px";
        new_value.style.right = "28px";
        new_value.style.pointerEvents = "none";
        new_container.appendChild(new_value);

        document.getElementById("last-played-card").appendChild(new_container);
    }
}
function update_points(){
    document.getElementById("points-display").innerHTML = "" + game.players[this_player].points;
}
function update_opponents(){
    let current_names = document.querySelectorAll("#opponent-container > p");
    for(let i = 0; i < current_names.length; i++){
        current_names[i].remove();
    }
    let current_divs = document.querySelectorAll("#opponent-container > form");
    for(let i = 0; i < current_divs.length; i++){
        current_divs[i].remove();
    }

    for(let i = 0; i < game.players.length; i++){
        if(i != this_player){
            let new_name = document.createElement("p");
            new_name.innerHTML = game.players[i].name + ": ";
            document.getElementById("opponent-container").appendChild(new_name);

            let new_form = document.createElement("form");
            new_form.setAttribute("id", "opponent-form" + i);
            new_form.style.display = "flex";
            new_form.style.flexDirection = "row";

            for(let j = 0; j < game.players[i].field.length; j++){
                let new_container = document.createElement("div");
                new_container.style.position = "relative";
                new_container.style.pointerEvents = "none";

                let new_radio = document.createElement("input");
                new_radio.setAttribute("type", "radio");
                new_radio.setAttribute("id", "opponent-field" + i + ":" + j);
                new_radio.setAttribute("name", "opponent-field" + i);
                new_radio.setAttribute("value", "" + j);
                new_radio.style.pointerEvents = "all";
                new_container.appendChild(new_radio);

                let new_suit = document.createElement("p");
                console.log(game.players[i].field[j].suit);
                switch(game.players[i].field[j].suit){
                    case "clubs":
                        new_suit.innerHTML = "♣";
                        new_suit.style.color = "black";
                        break;
                    case "diamonds":
                        new_suit.innerHTML = "♦";
                        new_suit.style.color = "red";
                        break;
                    case "hearts":
                        new_suit.innerHTML = "♥";
                        new_suit.style.color = "red";
                        break;
                    case "spades":
                        new_suit.innerHTML = "♠";
                        new_suit.style.color = "black";
                        break;
                }
                new_suit.style.position = "absolute";
                new_suit.style.fontSize = "35px";
                new_suit.style.top = "-15px";
                new_suit.style.left = "28px";
                new_suit.style.pointerEvents = "none";
                new_container.appendChild(new_suit);

                let new_value = document.createElement("p");
                new_value.innerHTML = game.players[i].field[j].value;
                new_value.style.position = "absolute";
                new_value.style.fontSize = "50px";
                new_value.style.bottom = "-30px";
                new_value.style.right = "28px";
                new_value.style.pointerEvents = "none";
                new_container.appendChild(new_value);

                // Clear other fields if the radio button is selected.
                // This prevents the player from targeting multiple players.
                new_radio.addEventListener("change", function() {
                    let opponent_fields = [];
                    let all_fields = document.querySelectorAll("form");
                    for(let i = 0; i < all_fields.length; i++){
                        if(all_fields[i] != this.parentElement.parentElement && all_fields[i].id !== "hand-form" && all_fields[i].id !== "field-form"){
                            opponent_fields.push(all_fields[i]);
                        }
                    }
                    for(let i = 0; i < opponent_fields.length; i++){
                        opponent_fields[i].reset();
                    }
                });

                new_form.appendChild(new_container);
            }
            document.getElementById("opponent-container").appendChild(new_form);
        }
    }
}
function update_hand(){
    let current_divs = document.querySelectorAll("#hand-form > div");
    for(let i = 0; i < current_divs.length; i++){
        current_divs[i].remove();
    }

    for(let i = 0; i < game.players[this_player].hand.length; i++){
        let form = document.getElementById("hand-form");

        let new_container = document.createElement("div");
        new_container.style.position = "relative";

        let new_radio = document.createElement("input");
        new_radio.setAttribute("type", "radio");
        new_radio.setAttribute("id", "hand" + i);
        new_radio.setAttribute("name", "hand");
        new_radio.setAttribute("value", "" + i);
        new_container.appendChild(new_radio);

        let new_suit = document.createElement("p");
        switch(game.players[this_player].hand[i].suit){
            case "clubs":
                new_suit.innerHTML = "♣";
                new_suit.style.color = "black";
                break;
            case "diamonds":
                new_suit.innerHTML = "♦";
                new_suit.style.color = "red";
                break;
            case "hearts":
                new_suit.innerHTML = "♥";
                new_suit.style.color = "red";
                break;
            case "spades":
                new_suit.innerHTML = "♠";
                new_suit.style.color = "black";
                break;
        }
        new_suit.style.position = "absolute";
        new_suit.style.fontSize = "35px";
        new_suit.style.top = "-15px";
        new_suit.style.left = "28px";
        new_suit.style.pointerEvents = "none";
        new_container.appendChild(new_suit);

        let new_value = document.createElement("p");
        new_value.innerHTML = game.players[this_player].hand[i].value;
        new_value.style.position = "absolute";
        new_value.style.fontSize = "50px";
        new_value.style.bottom = "-30px";
        new_value.style.right = "28px";
        new_value.style.pointerEvents = "none";
        new_container.appendChild(new_value);

        form.insertBefore(new_container, form.children[form.children.length - 1]);
    }
}
function update_field(){
    let current_radios = document.querySelectorAll("#field-form > div");
    for(let i = 0; i < current_radios.length; i++){
        current_radios[i].remove();
    }

    for(let i = 0; i < game.players[this_player].field.length; i++){
        let form = document.getElementById("field-form");

        let new_container = document.createElement("div");
        new_container.style.position = "relative";

        let new_radio = document.createElement("input");
        new_radio.setAttribute("type", "radio");
        new_radio.setAttribute("id", "field" + i);
        new_radio.setAttribute("name", "field");
        new_radio.setAttribute("value", "" + i);
        new_container.appendChild(new_radio);

        let new_suit = document.createElement("p");
        switch(game.players[this_player].field[i].suit){
            case "clubs":
                new_suit.innerHTML = "♣";
                new_suit.style.color = "black";
                break;
            case "diamonds":
                new_suit.innerHTML = "♦";
                new_suit.style.color = "red";
                break;
            case "hearts":
                new_suit.innerHTML = "♥";
                new_suit.style.color = "red";
                break;
            case "spades":
                new_suit.innerHTML = "♠";
                new_suit.style.color = "black";
                break;
        }
        new_suit.style.position = "absolute";
        new_suit.style.fontSize = "35px";
        new_suit.style.top = "-15px";
        new_suit.style.left = "28px";
        new_suit.style.pointerEvents = "none";
        new_container.appendChild(new_suit);

        let new_value = document.createElement("p");
        new_value.innerHTML = game.players[this_player].field[i].value;
        new_value.style.position = "absolute";
        new_value.style.fontSize = "50px";
        new_value.style.bottom = "-30px";
        new_value.style.right = "28px";
        new_value.style.pointerEvents = "none";
        new_container.appendChild(new_value);

        form.insertBefore(new_container, form.children[form.children.length - 1]);
    }
}