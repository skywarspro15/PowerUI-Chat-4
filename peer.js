var peer;
var call;

var startTime, endTime;
var intElapsed;

var curStream;
var dialTimeout = 5;
var dialInterval;

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
      const ringtone = document.createElement("audio");

      ringtone.style.display = "none";
      ringtone.src = "sounds/incoming.wav";
      ringtone.loop = "true";
      document.body.appendChild(ringtone);
      ringtone.play();

      document.getElementById("callText").innerHTML =
        call.peer + " is calling you! <br> Accept the call?";

      unHideModal("callIncoming");

      let pingRecv = setInterval(function () {
        sendSocketMessage("CALL RECV|" + user + ":" + call.peer);
      }, 200);

      let accept = document.getElementById("answer");
      let decline = document.getElementById("decline");

      accept.addEventListener(
        "click",
        function () {
          clearInterval(pingRecv);
          ringtone.remove();
          hideModal("callIncoming");
          var getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
          getUserMedia({ audio: true }, function (stream) {
            curStream = stream;
            call.answer(stream);
            call.on("stream", function (remoteStream) {
              const answered = new Audio("sounds/answer.wav");
              const audio = document.createElement("audio");
              const callScreen = document.getElementById("callScreen");
              const sessUser = document.getElementById("sessUser");
              const bgImage = document.getElementById("bgImage");
              const endCall = document.getElementById("endCall");
              const inCall = document.getElementById("inCall");
              answered.play();
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
                  const hangUp = new Audio("sounds/hangup.wav");
                  hangUp.play();
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
          clearInterval(pingRecv);
          ringtone.remove();
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
  const dialtone = document.createElement("audio");

  dialtone.style.display = "none";
  dialtone.src = "sounds/dialing.wav";
  dialtone.loop = "true";
  dialtone.id = "dialtone";
  document.body.appendChild(dialtone);
  dialtone.play();

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
      dialInterval = setInterval(function () {
        dialTimeout = dialTimeout - 1;
        if (dialTimeout > 0) {
          const error = new Audio("sounds/disconnected.wav");
          clearInterval(dialInterval);
          dialtone.remove();
          error.play();
          hideModal("callRinging");
          unHideModal("callDeclined");
          setTimeout(function () {
            stopStream();
            call.close();
          }, 1000);
        }
      }, 1000);
      call.on("stream", function (remoteStream) {
        clearInterval(dialInterval);
        dialtone.remove();
        hideModal("callRinging");
        const answered = new Audio("sounds/answer.wav");
        const audio = document.createElement("audio");
        const callScreen = document.getElementById("callScreen");
        const sessUser = document.getElementById("sessUser");
        const bgImage = document.getElementById("bgImage");
        const endCall = document.getElementById("endCall");
        const inCall = document.getElementById("inCall");
        answered.play();
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

function extendTimeout() {
  dialTimeout = 5;
}
