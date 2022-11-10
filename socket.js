var reconnectingState = false;
var socket;
var timeout;

function connect() {
  socket = null;
  socket = new WebSocket("wss://PowerUI-Chat-4-Real-time.skywarspro15.repl.co");

  socket.addEventListener("open", function (event) {
    if (reconnectingState == true) {
      hideModal("connectionLost");
    }
    console.info("Connected to Real-time servers");
  });

  socket.addEventListener("message", function (event) {
    let dataType = String(event.data).split("|")[0];
    let dataContent = String(event.data).split("|")[1];

    if (dataType == "DECLINE") {
      let declinedBy = String(dataContent).split(":")[0];
      let declinedTo = String(dataContent).split(":")[1];
      let openedUser = document.getElementById("curUser").innerHTML;
      let dialtone = document.getElementById("dialtone");
      let error = new Audio("sounds/disconnected.wav");
      if (
        declinedBy == openedUser &&
        declinedTo == localStorage.getItem("username")
      ) {
        dialtone.remove();
        error.play();
        hideModal("callRinging");
        unHideModal("callDeclined");
        setTimeout(function () {
          stopStream();
        }, 1000);
      }
    }

    if (dataType == "CALL END") {
      let openedUser = document.getElementById("curUser").innerHTML;
      if (
        dataContent == openedUser ||
        dataContent == localStorage.getItem("username")
      ) {
        document.getElementById("callStream").remove;
        setTimeout(function () {
          stopStream();
        }, 1000);
        const callScreen = document.getElementById("callScreen");
        const sessUser = document.getElementById("sessUser");
        const bgImage = document.getElementById("bgImage");
        inCall.innerHTML = "false";
        bgImage.style.backgroundImage = "none";
        sessUser.innerHTML = "Call ended";
        callScreen.style.opacity = "0";
        callScreen.style.zIndex = "-4200000000";
      }
    }

    if (dataType == "IN CALL") {
      let declinedBy = String(dataContent).split(":")[0];
      let declinedTo = String(dataContent).split(":")[1];
      let openedUser = document.getElementById("curUser").innerHTML;
      let dialtone = document.getElementById("dialtone");
      let error = new Audio("sounds/disconnected.wav");
      if (
        declinedBy == openedUser &&
        declinedTo == localStorage.getItem("username")
      ) {
        dialtone.remove();
        error.play();
        hideModal("callRinging");
        unHideModal("userInCall");
        setTimeout(function () {
          hideModal("userInCall");
          stopStream();
        }, 3000);
      }
    }

    if (dataType == "MESSAGE") {
      let messageAuthor = String(dataContent).split(":")[0];
      let messageContent = String(dataContent).split(":")[1];

      let openedUser = document.getElementById("curUser").innerHTML;

      if (
        messageAuthor ==
        localStorage.getItem("username") + " to " + openedUser
      ) {
        addChatBubble(true, messageContent);
      } else if (
        messageAuthor ==
        openedUser + " to " + localStorage.getItem("username")
      ) {
        addChatBubble(false, messageContent);
      }

      setTimeout(function () {
        window.scrollTo(0, document.body.scrollHeight);
      }, 500);
    }

    if ((dataType = "CALL RECV")) {
      let recvBy = String(dataContent).split(":")[0];
      let recvTo = String(dataContent).split(":")[1];
      let openedUser = document.getElementById("curUser").innerHTML;
      if (recvBy == openedUser && recvTo == localStorage.getItem("username")) {
        extendTimeout();
      }
    }
  });

  socket.addEventListener("error", function (event) {
    reconnectingState = true;
    console.error("Disconnected from server");
    unHideModal("connectionLost");
    setTimeout(function () {
      connect();
    }, 1000);
  });
}

function sendSocketMessage(message) {
  socket.send(message);
}
