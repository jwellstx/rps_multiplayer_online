var rps = {
    player: "",
    playerNumber: "",
    validPlayer: true,

    // Your web app's Firebase configuration
    firebaseConfig: {
        apiKey: "AIzaSyCmxsqywOfL6FFWSPLYj0Xzpt8IlowpEXM",
        authDomain: "rps-online-ff69c.firebaseapp.com",
        databaseURL: "https://rps-online-ff69c.firebaseio.com",
        projectId: "rps-online-ff69c",
        storageBucket: "rps-online-ff69c.appspot.com",
        messagingSenderId: "1043161468755",
        appId: "1:1043161468755:web:a1bc186716f21779f85ba6"
    },

    Start: function () {
        firebase.initializeApp(this.firebaseConfig);
        var db = firebase.database();

        // Basic initialization of DB. Reset db is used to inform both players 
        // if one person dropped and who dropped (player1 or player2)
        /* db structure 
                reset -> used to store reset game status
                users -> stores player1 and player2 names and if they are present
                game -> stores the score values
                choice -> stores each users choice
        */
        db.ref().update({
            reset: {
                state: false,
                dcplayer: ""
            }
        });

        // Resets game if player leaves
        this.reset(db);
        // setups up listeners for player submit buttons
        this.setupPlayerSubmitButtons(db);
        // checks if both players are present and starts the RPS game
        this.checkForPlayersAndStartGame(db);
        // enables listeners for chat
        this.enableChat(db);
    },
    reset: function (db) {
        /* 
            Purpose: Monitors the reset DB to see if someone unloaded their window.
                     If so, reload the other players screen to start a new game, inform
                     the only remaining user that someone has left and then reset the "state"
            Inputs: db reference
            Outputs: Nothing
        */

        db.ref("reset").on("value", snapshot => {
            var reset = snapshot.val();
            if (reset !== null && reset.state && reset.dcplayer) {
                // empty out DB since someone left and we want to start over
                db.ref().set(null);
                // If i'm the remaining player, for me to reload to start game over
                if (rps.playerNumber !== reset.dcplayer) {
                    location.reload();
                }
                var time = moment().format("MM/DD/YYYY h:mm a");
                db.ref().update({
                    reset: {
                        state: false,
                        dcplayer: ""
                    }
                });
                alert(reset.dcplayer + " has left the game!");
                db.ref("messages").off("child_added", commentListener);
            }
        });
    },
    setupPlayerSubmitButtons: function (db) {
        /*
            Purpose: setup submit buttons.  Once either player1 or player2 name is submitted,
                     setup the page as if we are either player1 or player2 and then notify
                     the DB that player1 or player2 is present.
            Input: reference DB
            Output: None
        */

        $("#player1Submit").on("click", function () {
            rps.player = $("#player1Name").val().trim();
            rps.playerNumber = "player1";
            $(".p2login, #p2buttons").hide();
            $(".p1").css({"border-color": "#4F2C1DFF", "border-width": "7px"})
            $(".p2").css("border-color", "red")

            db.ref("users/player1").set({
                name: rps.player,
                present: true,
            });
        });

        $("#player2Submit").on("click", function () {
            rps.player = $("#player2Name").val().trim();
            rps.playerNumber = "player2";
            $(".p1login, #p1buttons").hide();
            $(".p1").css("border-color", "red");
            $(".p2").css({"border-color": "#4F2C1DFF", "border-width": "7px"});

            db.ref("users/player2").set({
                name: rps.player,
                present: true,
            });
        });

        // Force submit buttons if the user hits 'Enter' - better way to do this?
        $(document).on("keyup", "#player1Name", function (event) {
            if (event.key !== "Enter") return;
            $('#player1Submit').click();
            event.preventDefault();
        });
        $(document).on("keyup", "#player2Name", function (event) {
            if (event.key !== "Enter") return;
            $('#player2Submit').click();
            event.preventDefault();
        });
    },
    enableChat: function (db) {
        // when comment is submitted, upload it to DB and display on both players page
        $("#submitCmt").on("click", e => {
            if (rps.player) {
                e.preventDefault();
                var comment = $("#comment").val().trim();
                var time = moment().format("MM/DD/YYYY h:mm a");
                db.ref("messages").push({
                    commenter: rps.player,
                    comment: comment,
                    time: time
                });
                $("#comment").val("");
            }
        });
        // force click when enter is pressed - better way?
        $(document).on("keyup", "#comment", function (event) {
            if (event.key !== "Enter") return;
            $('#submitCmt').click();
            event.preventDefault();
        });

        // listener for when some enters a chat message
        let commentListener = db.ref("messages").on("child_added", snapshot => {
            var cont = `
                        <div class="row">
                            <div class="col-lg-12">
                                 [${snapshot.val().time}] ${snapshot.val().commenter}: ${snapshot.val().comment}
                            </div>
                        </div>
                    `;
            $(".commentSection").append(cont);
            $(".commentSection").scrollTop($(".commentSection")[0].scrollHeight);  // scroll to bottom of text box on page refresh

        });
    },
    checkForPlayersAndStartGame: function (db) {
        /*
            Purpose: check for player1 and player2 existence, modify html based on if player1 
                     or if player2.  Notify when players enter then start the game. Additional 
                     conditions added if a third person tries to enter, they become a spectator.
            Inputs: reference db
            Ouputs: None
        */
        db.ref("users").once("value", snapshot => {
            var dbRef = snapshot.val();
            if (snapshot.child("player1").exists() && snapshot.child("player2").exists() && dbRef !== null) {
                // This is the case if a third person tried to join.  It would not interrupt the game but rather
                // make them a spectator and they can see the game live.
                $("#p1buttons input").removeClass("p1sel").addClass("specBG");
                $("#p2buttons input").removeClass("p2sel").addClass("specBG");
                $(".spec").hide();
                rps.validPlayer = false;
            }
        }).then(function () {

            // Create our listener if we decided we are a valid player and not a spectator
            db.ref("users").on("value", snapshot => {
                var dbRef = snapshot.val();
                if (rps.validPlayer) {
                    // If player1 name was submitted, hide player1 login, display name and setup onunload function
                    // Also inform that player1 has entered the game
                    if (snapshot.child("player1").exists()) {
                        $(".p1login").empty();
                        $(".p1selected").html("Player 1 selected, waiting on player2!");
                        $("#p1Name").html(dbRef.player1.name);

                        rps.notifyPlayerEnteredAndSetupOnunload(db, dbRef.player1.name, rps.playerNumber, "p1");
                    }
                    // If player2 name was submitted, hide player2 login, display name and setup onunload function
                    // Also inform that player1 has entered the game
                    if (snapshot.child("player2").exists()) {
                        $(".p2login").empty();
                        $(".p2selected").html("Player 2 selected, waiting on player1!");
                        $("#p2Name").html(dbRef.player2.name);

                        rps.notifyPlayerEnteredAndSetupOnunload(db, dbRef.player2.name, rps.playerNumber, "p2");
                    }
                    // If both players are present, we are ready to play, start the game
                    if (snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
                        $(".p1selected, .p2selected").remove();
                        rps.StartGame(db);
                    }
                }
                else {
                    // Condition if i'm a spectator, just display names, remove logins and start the game
                    $("#p1Name").html(dbRef.player1.name);
                    $("#p2Name").html(dbRef.player2.name);
                    $(".p1login, .p2login").empty();
                    rps.StartGame(db);
                }
            });
        });
    },
    notifyPlayerEnteredAndSetupOnunload: function (db, playerName, playerNumber, p) {
        // Notify chat that a player has entered the game (uses db listener)
        var time = moment().format("MM/DD/YYYY h:mm a");
        var commentLeft = " has entered the game!";
        db.ref("messages/" + p).update({
            commenter: playerName,
            comment: commentLeft,
            time: time,
        });

        // onunload, set reset state to true and log who quit
        // "reset" listener will then call reset() function, and reset the game
        window.onunload = function () {
            db.ref("reset").update({
                state: true,
                dcplayer: playerNumber,
            });
        }
    },
    StartGame: function (db) {
        var picked = false;
        if (rps.validPlayer) {
            // Add cores if we are a valid player - only init once at beginning
            // techncially twice since we have 2 players
            db.ref().update({
                game: {
                    ties: 0,
                    player1wins: 0,
                    player2wins: 0,
                    player1loss: 0,
                    player2loss: 0,
                },
            });

        }

        // Listener for when scores are updated -> print the results to screen
        db.ref("game").on("value", snapshot => {
            var dbRef = snapshot.val();

            $("#p1wins").text(dbRef.player1wins);
            $("#p1losses").text(dbRef.player1loss);
            $("#p2wins").text(dbRef.player2wins);
            $("#p2losses").text(dbRef.player2loss);
            $("#numOfTies").text(dbRef.ties);
        });

        // When player 1/2 selected RPS, notify db/listener about it and notify that we have picked a choice
        $(".p1sel, .p2sel").on("click", function () {
            if (!picked) {
                $(this).css({
                    "border": "solid 5px #4F2C1DFF",
                    "border-radius": "20px"
                });
                db.ref("choices/" + rps.playerNumber).update({
                    choice: $(this).val()
                });
                picked = true;
            }
        });

        // Score checking, when both players choice exists, check results and then update "game" db with who won.
        // Additionally, show the each player what the other chose in the "then" function.
        db.ref("choices").on("value", snapshot => {
            var dbRef = snapshot.val();
            if (dbRef !== null && snapshot.child("player1/choice").exists() && snapshot.child("player2/choice").exists()) {
                var results = dbRef.player1.choice + dbRef.player2.choice;
                db.ref("game").once("value", snap => {
                    var dbRefGame = snap.val();
                    switch (results) {
                        case "ss":
                        case "pp":
                        case "rr":
                            db.ref("game").update({
                                ties: parseInt(dbRefGame.ties) + 1
                            });
                            break;
                        case "sp":
                        case "pr":
                        case "rs":
                            db.ref("game").update({
                                player1wins: parseInt(dbRefGame.player1wins) + 1,
                                player2loss: parseInt(dbRefGame.player2loss) + 1
                            });
                            break;
                        case "sr":
                        case "rp":
                        case "ps":
                            db.ref("game").update({
                                player1loss: parseInt(dbRefGame.player1loss) + 1,
                                player2wins: parseInt(dbRefGame.player2wins) + 1
                            });
                            break;
                        default:
                            alert("Not a valid entry");  // shouldnt ever hit this
                    }

                }).then(function () {
                    // This code reveals the choices to both player1, player2 and the spectator and the sets them back
                    // for the next move after 5 seconds for the next round.
                    $("#p1buttons, #p2buttons").show();
                    $("#p1buttons input[value='" + dbRef.player1.choice + "'], #p2buttons input[value='" + dbRef.player2.choice + "']").css({"border": "5px solid #4F2C1DFF", "border-radius": "20px"});
                    db.ref("choices").set(null); // reset choices -> moved out of Promise due to race conditions with next user choice. 
                    new Promise(resolve => setTimeout(resolve, 5000)).then(() => {
                        picked = false;
                        $(".p1sel, .p2sel, .specBG").css({
                            "border": "none"
                        });
                        if (rps.playerNumber === "player1") { $("#p2buttons").hide(); }
                        if (rps.playerNumber === "player2") { $("#p1buttons").hide(); }
                    });

                });

            }
        });
    },
}

$(function () {
    // Start the ROCK-PAPER-SCISSOR game
    rps.Start();
});