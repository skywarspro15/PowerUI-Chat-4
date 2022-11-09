var peer;
var call;

var startTime, endTime;
var intElapsed;

var curStream;

function openPeer(user) {
  try {
    peer = new Peer(user);
  } catch (err) {
    console.error("An error occured while connecting to WebRTC: " + err);
  }

  peer.on("open", function (id) {
    console.info("Connected to WebRTC with id: " + id);
  });

  peer.on("call", function (call) {
    if (document.getElementById("inCall").innerHTML != "true") {
      document.getElementById("callText").innerHTML =
        call.peer + " is calling you! <br> Accept the call?";

      unHideModal("callIncoming");

      let accept = document.getElementById("answer");
      let decline = document.getElementById("decline");

      accept.addEventListener(
        "click",
        function () {
          hideModal("callIncoming");
          var getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
          getUserMedia({ audio: true }, function (stream) {
            curStream = stream;
            call.answer(stream);
            call.on("stream", function (remoteStream) {
              const audio = document.createElement("audio");
              const callScreen = document.getElementById("callScreen");
              const sessUser = document.getElementById("sessUser");
              const bgImage = document.getElementById("bgImage");
              const endCall = document.getElementById("endCall");
              const inCall = document.getElementById("inCall");
              inCall.innerHTML = "true";
              endCall.addEventListener(
                "click",
                function () {
                  let curUser = call.peer;
                  sendSocketMessage("CALL END|" + curUser);
                  document.getElementById("callStream").remove;
                  const callScreen = document.getElementById("callScreen");
                  const sessUser = document.getElementById("sessUser");
                  const bgImage = document.getElementById("bgImage");
                  bgImage.style.backgroundImage = "none";
                  sessUser.innerHTML = "Call ended";
                  callScreen.style.opacity = "0";
                  callScreen.style.zIndex = "-4200000000";
                  call.close();
                },
                { once: true }
              );
              bgImage.style.backgroundImage =
                'url("https://source.unsplash.com/random/1080x1920/?connection")';
              sessUser.innerHTML = call.peer;
              callScreen.style.opacity = "1";
              callScreen.style.zIndex = "4200000000";
              audio.style.display = "none";
              audio.srcObject = remoteStream;
              audio.id = "callStream";
              document.body.appendChild(audio);
              audio.play();
              startTime = new Date();
              intElapsed = setInterval(function () {
                endTime = new Date();
                let timeDiff = endTime - startTime;
                var days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                var hours = Math.floor(
                  (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                var minutes = Math.floor(
                  (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
                );
                var seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                document.getElementById("sessTime").innerHTML =
                  hours.toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  }) +
                  ":" +
                  minutes.toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  }) +
                  ":" +
                  seconds.toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  }) +
                  " elapsed";
              }, 1000);
            });
          });
        },
        { once: true }
      );

      decline.addEventListener(
        "click",
        function () {
          sendSocketMessage("DECLINE|" + user + ":" + call.peer);
          hideModal("callIncoming");
        },
        { once: true }
      );
    } else {
      sendSocketMessage("IN CALL|" + user + ":" + call.peer);
      hideModal("callIncoming");
    }
  });
}

function callUser(user) {
  unHideModal("callRinging");
  var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
  getUserMedia(
    { audio: true },
    function (stream) {
      curStream = stream;
      call = peer.call(user, stream);
      call.on("stream", function (remoteStream) {
        hideModal("callRinging");
        const audio = document.createElement("audio");
        const callScreen = document.getElementById("callScreen");
        const sessUser = document.getElementById("sessUser");
        const bgImage = document.getElementById("bgImage");
        const endCall = document.getElementById("endCall");
        const inCall = document.getElementById("inCall");
        inCall.innerHTML = "true";
        endCall.addEventListener(
          "click",
          function () {
            let curUser = call.peer;
            sendSocketMessage("CALL END|" + curUser);
            document.getElementById("callStream").remove;
            const callScreen = document.getElementById("callScreen");
            const sessUser = document.getElementById("sessUser");
            const inCall = document.getElementById("inCall");
            const bgImage = document.getElementById("bgImage");
            inCall.innerHTML = "false";
            bgImage.style.backgroundImage = "none";
            sessUser.innerHTML = "Call ended";
            callScreen.style.opacity = "0";
            callScreen.style.zIndex = "-4200000000";
            call.close();
          },
          { once: true }
        );
        bgImage.style.backgroundImage =
          'url("https://source.unsplash.com/random/1080x1920/?connection")';
        sessUser.innerHTML = call.peer;
        callScreen.style.opacity = "1";
        callScreen.style.zIndex = "4200000000";
        audio.style.display = "none";
        audio.srcObject = remoteStream;
        audio.id = "callStream";
        document.body.appendChild(audio);
        audio.play();
        startTime = new Date();
        intElapsed = setInterval(function () {
          endTime = new Date();
          let timeDiff = endTime - startTime;
          var days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          var hours = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          var minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          var seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          document.getElementById("sessTime").innerHTML =
            hours.toLocaleString("en-US", {
              minimumIntegerDigits: 2,
              useGrouping: false,
            }) +
            ":" +
            minutes.toLocaleString("en-US", {
              minimumIntegerDigits: 2,
              useGrouping: false,
            }) +
            ":" +
            seconds.toLocaleString("en-US", {
              minimumIntegerDigits: 2,
              useGrouping: false,
            }) +
            " elapsed";
        }, 1000);
      });
    },
    function (err) {
      console.error("Failed to get local stream: " + err);
    }
  );
}

function tryAgain() {
  let curUser = call.peer;
  hideModal("callDeclined");
  call.close();
  callUser(curUser);
}

function closeCall() {
  hideModal("callDeclined");
  call.close();
}

function stopStream() {
  curStream.getTracks().forEach(function (track) {
    track.stop();
  });
}
