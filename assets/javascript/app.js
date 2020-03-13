// TODO: make sure third person doesnt reset the stats
// comment, reorganize, sub calls, general cleanup

var rps = {
    name: null,
    pwd: "",
    currentGameIndex: 0,
    player: 0,
    playerNumber: "",
    selectedMove: false,
    gameInProgress: false,

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
        db.ref().update({
            reset: {
                state: false,
                dcplayer: ""
            }
        });

        db.ref("reset").on("value", snapshot => {
            var reset = snapshot.val();
            if (reset.state) {
                db.ref().set(null);
                if (rps.playerNumber !== reset.dcplayer) {
                    location.reload();
                }
                db.ref("reset").update({
                    state: false,
                    dcplayer: ""
                });

                alert("The other player has left the game!");
            }
        });

        db.ref("users").once("value", snapshot => {
            var dbRef = snapshot.val();
            console.log(snapshot, dbRef);
            if (snapshot.child("player1").exists() && snapshot.child("player2").exists() && dbRef !== null) {
                $("#p1buttons, #p2buttons, .spec").hide();
                rps.gameInProgress = true;
            }
        });

        $("#player1Submit").on("click", function () {
            rps.player = $("#player1Name").val().trim();
            rps.playerNumber = "player1";
            $(".p2login, #p2buttons").hide();

            db.ref("users/player1").set({
                name: rps.player,
                present: true,
            });
        });

        $("#player2Submit").on("click", function () {
            rps.player = $("#player2Name").val().trim();
            rps.playerNumber = "player2";
            $(".p1login, #p1buttons").hide();

            db.ref("users/player2").set({
                name: rps.player,
                present: true,
            });
        });

        db.ref("users").on("value", snapshot => {
            var dbRef = snapshot.val();
            if (snapshot.child("player1").exists()) {
                $(".p1login").empty();
                $(".p1selected").html("Player 1 selected, waiting on player2!");
                $("#p1Name").html(dbRef.player1.name);

                window.onunload = function () {
                    db.ref("reset").update({
                        state: true,
                        dcplayer: rps.playerNumber,
                    });
                }
            }
            if (snapshot.child("player2").exists()) {
                $(".p2login").empty();
                $(".p2selected").html("Player 2 selected, waiting on player1!");
                $("#p2Name").html(dbRef.player2.name);

                window.onunload = function () {
                    db.ref("reset").update({
                        state: true,
                        dcplayer: rps.playerNumber,
                    });
                }
            }
            if (snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
                $(".p1selected, .p2selected").remove();
                console.log("we are ready to play!!");
                console.log(rps.gameInProgress);
                if (!rps.gameInProgress) {
                    rps.StartGame(db);
                }
            }
        });

        $("#submitCmt").on("click", e => {
            console.log(rps.player);
            if (rps.player) {
                e.preventDefault();
                var comment = $("#comment").val().trim();
                var time = moment().format("MM/DD/YYYY h:m a");
                // var time = moment().format("h:m a");
                db.ref("messages").push({
                    commenter: rps.player,
                    comment: comment,
                    time: time
                });
                $("#comment").val("");
            }
        });

        $(document).on("keyup", "#comment", function (event) {
            if (event.key !== "Enter") return;
            $('#submitCmt').click();
            event.preventDefault();
        });
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

        db.ref("messages").on("child_added", snapshot => {
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
    StartGame: function (db) {
        var picked = false;
        db.ref().update({
            game: {
                ties: 0,
                player1wins: 0,
                player2wins: 0,
                player1loss: 0,
                player2loss: 0
            }
        });

        db.ref("game").on("value", snapshot => {
            var dbRef = snapshot.val();

            $("#p1wins").text(dbRef.player1wins);
            $("#p1losses").text(dbRef.player1loss);
            $("#p2wins").text(dbRef.player2wins);
            $("#p2losses").text(dbRef.player2loss);
            $("#numOfTies").text(dbRef.ties);
        });

        $(".p1sel").on("click", function () {
            console.log(picked, $(this).val());
            if (!picked) {
                console.log(rps.playerNumber);
                $(this).css({
                    "background-color": "red"
                });
                db.ref("choices/" + rps.playerNumber).update({
                    choice: $(this).val()
                });
                picked = true;
            }
        });
        $(".p2sel").on("click", function () {
            console.log(picked, $(this).val());
            if (!picked) {
                console.log(rps.playerNumber);
                $(this).css({
                    "background-color": "red"
                });
                db.ref("choices/" + rps.playerNumber).update({
                    choice: $(this).val()
                });
                picked = true;
            }
        });

        db.ref("choices").on("value", snapshot => {
            var dbRef = snapshot.val();
            console.log(dbRef);
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
                    $("#p1buttons, #p2buttons").show();
                    $("#p1buttons input[value='" + dbRef.player1.choice + "'], #p2buttons input[value='" + dbRef.player2.choice + "']").css("background-color", "red");
                    new Promise(resolve => setTimeout(resolve, 5000)).then(() => {
                        picked = false;
                        db.ref("choices/player1/choice").set(null);
                        db.ref("choices/player2/choice").set(null);
                        $(".p1sel, .p2sel").css({
                            "background-color": "black"
                        });
                        if (rps.playerNumber === "player1") { $("#p2buttons").hide(); }
                        if (rps.playerNumber === "player2") { $("#p1buttons").hide(); }
                    });

                });

            }
        });
    },
    results: function () {

    },
}

$(function () {
    rps.Start();
});