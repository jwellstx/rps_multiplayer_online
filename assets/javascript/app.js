var rps = {
    name: null,
    pwd: "",
    currentGameIndex: 0,
    player: 0,
    selectedMove: false,

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

        $("#player1Submit").on("click", function () {
            rps.player = $("#player1Name").val().trim();
            $(".p2login").empty();
            db.ref("users/player1").set({
                name: rps.player,
                present: true,
            });
        });

        $("#player2Submit").on("click", function () {
            rps.player = $("#player2Name").val().trim();
            $(".p1login").empty();
            db.ref("users/player2").set({
                name: rps.player,
                preset: true
            });
        });

        db.ref("users").on("value", snapshot => {
            var dbRef = snapshot.val();
            if (snapshot.child("player1").exists()) {
                $(".p1login").empty();
                $(".p1selected").html("Player 1 selected, waiting on player2!");
            }
            if (snapshot.child("player2").exists()) {
                $(".p2login").empty();
                $(".p2selected").html("Player 2 selected, waiting on player1!");
            }
            if (snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
                $(".p1selected, .p2selected").remove();
                console.log("we are ready to play!!");
                rps.StartGame();
            }
        });

        $("#submitCmt").on("click", e => {
            console.log(rps.player);
            if (rps.player) {
                e.preventDefault();
                var comment = $("#comment").val().trim();
                db.ref("messages").push({
                    commenter: rps.player,
                    comment: comment
                });
                $("#comment").val("");
            }
        });

        $(document).on("keyup", "#comment", function (event) {
            if (event.key !== "Enter") return;
            $('#submitCmt').click();
            event.preventDefault();
        });

        db.ref("messages").on("child_added", snapshot => {
            var cont = `
                        <div class="row">
                            <div class="col-lg-12">
                                 ${snapshot.val().commenter} : ${snapshot.val().comment}
                            </div>
                        </div>
                    `;
            $(".testing").append(cont);
            $(".testing").scrollTop($(".testing")[0].scrollHeight);  // scroll to bottom of text box on page refresh

        });
    },
    StartGame: function () {

    }
}

$(function () {

    rps.Start();
});




//////////////////////////////////////////////// UGH ////////////////////////////////////////////////////////


// $(".p2login").hide();
//         // Initialize Firebase
//         firebase.initializeApp(this.firebaseConfig);
//         var dB = firebase.database();

//         $("#player1Submit").on("click", e => {
//             e.preventDefault();
//             rps.player = $("#player1Name").val().trim();


//             dB.ref().once("value", snapshot => {
//                 var gameDB = snapshot.val();

//                 if (gameDB === null) {
//                     console.log("i'm player1");
//                     dB.ref("users/player1").set({
//                         name: rps.player,
//                         present: true
//                     });
//                     $(".p1login").hide();
//                     $("#status").html("Waiting on player2!");
//                     rps.player = "player1";
//                 }
//             });
//         });

//         dB.ref("users").on("value", snapshot => {
//             var gameDB = snapshot.val();
//             if (gameDB !== null && gameDB.users.player1.present) {
//                 $(".p2login").show();
//                 $("#player2Submit").on("click", e => {
//                     console.log("i'm player 2");
//                     dB.ref("users/player2").update({
//                         name: rps.player,
//                         present: true
//                     });
//                     $(".p2login").hide();
//                     rps.player = "player2";
//                 });
//             }
//         });




////////////////////////////////////////////// WORKING CHAT ////////////////////////////////////////////////

// Start: function () {
//     // Initialize Firebase
//     firebase.initializeApp(this.firebaseConfig);
//     var dB = firebase.database();

//     if (localStorage.getItem("RPSusername") === null) {
//         $("#submitBtn").on("click", e => {
//             e.preventDefault();
//             rps.name = $("#username").val().trim();
//             $("#whoami").html(rps.name);
//             rps.name = rps.name.toLowerCase();
//             // rps.pwd = $("#pwd").val().trim();
//             dB.ref("users/" + rps.name).set({
//                 name: rps.name,
//                 // password: rps.pwd
//             });
//             // localStorage.setItem("RPSusername", rps.name);
//             $(".login").empty();
//         });
//     }
//     else {
//         rps.name = localStorage.getItem("RPSusername");
//         $("#whoami").html("Logged in as: " + rps.name);
//         $(".login").remove();
//     }
//     $("#whoami").html(rps.name);

//     $("#submitCmt").on("click", e => {
//         if (rps.name) {
//             e.preventDefault();
//             var comment = $("#comment").val().trim();
//             dB.ref("messages").push({
//                 commenter: rps.name,
//                 comment: comment
//             });
//             $("#comment").val("");
//         }
//     });

//     $(document).on("keyup", "#comment", function (event) {
//         if (event.key !== "Enter") return;
//         $('#submitCmt').click();
//         event.preventDefault();
//     });

//     dB.ref("messages").on("child_added", snapshot => {
//         // $(".playerOne").append(snapshot.val().commenter + ": " + snapshot.val().comment + "<br>");

//         var cont = `
//             <div class="row">
//                 <div class="col-lg-12">
//                      ${snapshot.val().commenter} : ${snapshot.val().comment}
//                 </div>
//             </div>
//         `;
//         $(".testing").append(cont);
//         $(".testing").scrollTop($(".testing")[0].scrollHeight);  // scroll to bottom of text box on page refresh

//     });

//     dB.ref("users").on("child_added", snapshot => {
//         $(".playerTwo").append(snapshot.val().name + "<br>");
//     });

// },



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        // if (localStorage.getItem("RPSusername") === null) {
        //     $('#submitBtn').on("click", e => {
        //         e.preventDefault();
        //         this.login(dB);
        //     });
        // }
        // else {
        //     console.log("user logged in");
        //     $('.login').empty();
        //     this.name = localStorage.getItem("RPSusername");
        //     console.log(this.name);
        // }



        // dB.ref().on("child_added", snapshot => {
        //     console.log(snapshot.val().Justin);
        //     $("#userthis.name").append(snapshot.val());
        // });
    // },

    // login: (dB) => {
        // if (localStorage.getItem("RPSusername") === null) {
            // $('#submitBtn').on("click", e => {
                // e.preventDefault();
                // this.name = $("#username").val().trim();
                // var pwd = $("#pwd").val().trim();
                // dB.ref().child('users').once('value', function (snapshot) {
                //     if (snapshot.child(this.name).exists()) {
                //         console.log(snapshot);
                //         alert("Username already exists, Please try another one!");
                //         $("#submitBtn").unclick();
                //         rps.login(dB);
                //     }
                //     else {
                //         console.log(this.name + " " + pwd);
                //         alert("Your password was set to: " + pwd);
                //         localStorage.setItem("RPSusername", this.name);

                //         dB.ref("users/" + this.name).set({
                //             password: pwd
                //         });
                //     }
                // });
            // });
        // }
        // else {
        //     console.log("user logged in");
        //     $('.login').empty();
        //     this.name = localStorage.getItem("RPSusername");
        //     console.log(this.name);
        // }