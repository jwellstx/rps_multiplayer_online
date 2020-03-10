var rps = {
    name: null,
    pwd: "",
    currentGameIndex: 0,
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
        // Initialize Firebase
        firebase.initializeApp(this.firebaseConfig);
        var dB = firebase.database();

        if (localStorage.getItem("RPSusername") === null) {
            $("#submitBtn").on("click", e => {
                e.preventDefault();
                rps.name = $("#username").val().trim();
                // rps.pwd = $("#pwd").val().trim();
                dB.ref("users/" + rps.name).set({
                    name: rps.name,
                    // password: rps.pwd
                });
                // localStorage.setItem("RPSusername", rps.name);
                $("#whoami").html(rps.name);
                $(".login").remove();
            });
        }
        else {
            rps.name = localStorage.getItem("RPSusername");
            $("#whoami").html(rps.name);
            $(".login").remove();
        }
        $("#whoami").html(rps.name);

        $("#submitCmt").on("click", e => {
            if (rps.name) {
                e.preventDefault();
                var comment = $("#comment").val().trim();
                dB.ref("messages").push({
                    commenter: rps.name,
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

        dB.ref("messages").on("child_added", snapshot => {
            // $(".playerOne").append(snapshot.val().commenter + ": " + snapshot.val().comment + "<br>");

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

        dB.ref("users").on("child_added", snapshot => {
            $(".playerTwo").append(snapshot.val().name + "<br>");
        });

    },
}

$(function () {

    rps.Start();
});










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