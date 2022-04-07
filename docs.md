# Integer Pointer Pointer

* **Originality:** What is original about your game?
    * Card games do not typically use the suits of the cards to indicate completely seperate actions. This game designates a specific behavior for each suit.
* **Technical Merit:** What is interesting about your game technology?
    * The game runs (or is at least meant to run) on pure HTML/CSS/JavaScript, and otherwise uses no engine.
* **Prototype Postmortem:** What did you learn from this prototype? What was the easiest or hardest part of making it?
    * Limiting the scope of the game is something I will need to focus more on for the purposes of this class. I overscoped for this project and it caused me to not be ready for the first playtest.
* **Prototype Assets:** Did you make your prototype assets from scratch? Did you borrow them? Cite your sources here.
    * All of the assets for the game are either stock HTML elements or custom CSS styles. For the revision, I would like to have more CSS-styled elements, as stock HTML tends to look bad, but stock HTML is quicker to write.
* **Prototype Closest Other Game:** Which other game most closely resembles your game? If you are borrowing code from a Phaser Example, you must say so here. If you borrow code from elsewhere, you must say so here.
    * The card game Tycoon/Capitalism was the inspiration for having suits represent discrete actions, however, that game has different actions by number, not by suit.
* **High Concept:** A one-sentence summary of your game.
    * The goal of the game is to get as many points as you can before the deck is emptied, using direct and indirect methods.
    * I followed Youtube user Hungry Turtle Code's tutorial on socket.io in order to set up a local server for the game.
* **Theme:** State which of the themes or challenges you used.
    * "A player can join at any time"
* **Mandated Variety:** State which input, randomness, genre, and play style you used in this prototype.
    * Since multiplayer for this game is required, the variety will come by way of different player actions, as well as a randomly drawn hand from the central deck.
* **Prototype Goal:** What game mechanic is this prototype evaluating?
    * The main mechanic of the game is the field that you may play "trap"-cards onto. This is the "indirect method" for gaining points mentioned above. The players must plan ahead to steadily generate points.
* **Player Experience Goals:** What experience do you want players to have when playing your game?
    * I want players to feel like they are seizing opportunities whenever they have the option to play a trap card. It should feel more satisfying to gain points through indirect means than direct means.
* **Gameplay:** A paragraph describing the actions the player can perform, the system dynamics, and the core mechanic. Include a concise explanation of the prototype’s inputs and their expected effects (how to play). You can also describe game play that is not in the prototype. You may include mock-up images for parts of the game not in the prototype.
    * Every turn, the current player must play a card. The suit of the card they play determines the action they will take. The suits/behaviors are defined below.
        * Diamonds: Gain 1 point. Discard this card.
        * Spades: Place this card in front of the player. This area is called your "field". When another player plays a diamonds card on their turn, you may gain 2 points only if the spades card has a higher number than the diamonds card.
        * Clubs: Steal a field card from another player and place it in your field. This may be blocked by a hearts card.
        * Hearts: Place this card in your field. When a player tries to steal one of your field cards, you may block the attempt only if the number on the hearts card is higher than the number on the clubs card.
    * When all cards have been drawn from the deck and the last player takes their turn, the game ends and the player with the highest number of points wins.
* **Strategies:** What player strategies do you expect will be effective at playing this game?
    * I expect players to be hesitant to play diamonds cards, and they may only do so if they don't have any other option. Therefore, playing field cards or stealing will become superior options.
* **Story/Setting/Premise:** A paragraph about the world your game is set in and who the characters are. What makes the game world and its occupants unique and interesting? Do the tokens represent something? If the game has a backstory, mention it here. If the game is abstract, then say so. How will the dramatic tension interact with the gameplay tension?
    * This game does not contain narrative elements, regrettably.
* **Target Audience:** A single sentence that describes the demographic you're trying to reach.
    * This game is designed for a casual audience. It is turn based, so players may take as much time as they need to decide their next move. This game is also well suited to groups both in-person and far apart, due to the web hosting.
* **Play Time:** How long does your game take to play?
    * It depends on the number of players, but for a game with 3 players, the game takes roughly 10 minutes.