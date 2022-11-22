var count = 0;

async function addReactionBubble(you = false, message, reaction) {
  let chatBubble = document.getElementById(message);
  let reactionBubble = document.createElement("button");

  if (you) {
    reactionBubble.className = "reaction-bubble right";
  } else {
    reactionBubble.className = "reaction-bubble left";
  }

  reactionBubble.innerHTML = reaction;

  document.body.appendChild(reactionBubble);

  insertAfter(chatBubble, reactionBubble);
}

async function addChatBubble(you = false, message) {
  let elementExists = document.getElementById(message + "#" + count);

  if (elementExists) {
    count = count + 1;
  }

  let chatMessages = document.getElementById("chat-messages");

  let chatBubble = document.createElement("p");

  if (you) {
    chatBubble.className = "chat-bubble right";
  } else {
    chatBubble.className = "chat-bubble left";
  }

  chatBubble.innerHTML = message;
  chatBubble.id = message + "#" + count;

  chatMessages.appendChild(chatBubble);
}

async function userAddToList(name, status) {
  let chatList = document.getElementById("chatList");

  let user = document.createElement("div");
  user.className = "user";

  let chat = document.createElement("div");
  chat.className = "chat";

  let userName = document.createElement("p");
  let bold = document.createElement("strong");
  let nameRef = document.createElement("a");

  bold.innerHTML = name;
  nameRef.appendChild(bold);
  nameRef.href = "javascript:openChat('" + decodeHTML(name) + "');";
  userName.appendChild(nameRef);

  let userStatus = document.createElement("p");
  userStatus.innerHTML = status;

  chat.appendChild(userName);
  chat.appendChild(userStatus);
  user.appendChild(chat);
  chatList.appendChild(user);
}

async function allUsersAdd(name) {
  let userList = document.getElementById("userList");

  let user = document.createElement("li");
  let userLink = document.createElement("a");

  user.className = "curUser";

  userLink.href = "javascript:openChat('" + decodeHTML(name) + "');";
  userLink.innerHTML = name;

  user.appendChild(userLink);
  userList.appendChild(user);
}

async function getUsers() {
  Array.from(document.querySelectorAll(".curUser")).forEach(function (chat) {
    chat.remove();
  });

  allUsersAdd("Loading...");

  let users = await makeRequest(
    "GET",
    "https://PowerUI-Chat-4-Backend.skywarspro15.repl.co/getUsers.php"
  );

  Array.from(document.querySelectorAll(".curUser")).forEach(function (chat) {
    chat.remove();
  });

  array = users.trim().split("\n");

  array.forEach(function (user) {
    allUsersAdd(user);
  });
}

async function getMessages() {
  let users = await makeRequest(
    "GET",
    "https://PowerUI-Chat-4-Backend.skywarspro15.repl.co/getMessages.php?user=" +
      getCookie("username") +
      "&auth=" +
      getCookie("password")
  );
  array = users.trim().split("\n");

  for (var i = 0; i < array.length; i++) {
    userAddToList(array[i], await getStatus(array[i]));
  }
}

function unHideModal(id) {
  let modal = document.getElementById(id);
  modal.className = "modal";
}

function hideModal(id) {
  let modal = document.getElementById(id);
  modal.className = "modal hidden";
}

function newUser() {
  unHideModal("newUser");
  getUsers();
}

function closeChat() {
  let chatFrame = document.getElementById("curFrame");
  let exitButton = document.getElementById("exitButton");

  exitButton.className = "exitChat hidden";
  chatFrame.className = "chat-frame hidden";
  chatOpen.innerHTML = "False";
}

function openChat(name) {
  hideModal("newUser");
  let chatFrame = document.getElementById("curFrame");
  let exitButton = document.getElementById("exitButton");
  let chatOpen = document.getElementById("chatOpen");

  if (chatOpen.innerHTML == "True") {
    closeChat();
    setTimeout(function () {
      chatFrame.src = "chat.html?user=" + name;
      chatFrame.addEventListener(
        "load",
        function () {
          if (window.innerWidth <= 600) {
            exitButton.className = "exitChat";
          }
          chatFrame.className = "chat-frame";
          chatOpen.innerHTML = "True";
        },
        { once: true }
      );
    }, 500);
  } else {
    chatFrame.src = "chat.html?user=" + name;
    chatFrame.addEventListener(
      "load",
      function () {
        if (window.innerWidth <= 600) {
          exitButton.className = "exitChat";
        }
        chatFrame.className = "chat-frame";
        chatOpen.innerHTML = "True";
      },
      { once: true }
    );
  }
}

async function loadMessages(name) {
  let messages = await makeRequest(
    "GET",
    "https://powerui-chat-4-backend.skywarspro15.repl.co/openMessage.php?user=" +
      getCookie("username") +
      "&auth=" +
      getCookie("password") +
      "&recv=" +
      name
  );

  let array = messages.split("\n");

  for (var i = 0; i < array.length; i++) {
    if (String(array[i]).trim() != "") {
      let message = String(array[i]).trim().split(":");

      let sender = message[0];
      let content = "";

      for (var j = 1; j < message.length; j++) {
        if (j == 1) {
          content = message[j];
        } else {
          content = content + ":" + message[j];
        }
      }

      if (sender == getCookie("username")) {
        addChatBubble(true, content);
      } else {
        addChatBubble(false, content);
      }
    }
  }

  setTimeout(function () {
    window.scrollTo(0, document.body.scrollHeight);
  }, 500);
}

function sendToUser() {
  var curMessage = String(document.getElementById("messageInput").value).trim();
  if (curMessage != "") {
    sendMessage(urlParams.get("user"), curMessage);
    sendSocketMessage(
      "MESSAGE|" +
        getCookie("username") +
        " to " +
        urlParams.get("user") +
        ":" +
        curMessage
    );
    document.getElementById("messageInput").value = "";
  }
}

async function sendMessage(user, message) {
  let result = await makeRequest(
    "GET",
    "https://powerui-chat-4-backend.skywarspro15.repl.co/sendMessage.php?user=" +
      getCookie("username") +
      "&auth=" +
      getCookie("password") +
      "&recv=" +
      user +
      "&message=" +
      message
  );
  return result;
}

function setStatusUI() {
  let statusGreeting = document.getElementById("statusGreeting");
  statusGreeting.innerHTML =
    "Anything going on, " + encodeHTML(getCookie("username")) + "?";
  unHideModal("statusUI");
}

async function saveStatus() {
  let statusText = document.getElementById("statusText").value;
  if (statusText.trim() != "") {
    await setStatus(statusText.trim());
    hideModal("statusUI");
    document.getElementById("statusText").value = "";
  }
}

async function setStatus(status) {
  let curStatus = await makeRequest(
    "GET",
    "https://PowerUI-Chat-4-Backend.skywarspro15.repl.co/setStatus.php?user=" +
      getCookie("username") +
      "&auth=" +
      getCookie("password") +
      "&status=" +
      status
  );

  clearChatList();
  getMessages();

  return curStatus;
}

function clearChatList() {
  Array.from(document.querySelectorAll(".user")).forEach(function (chat) {
    chat.remove();
  });
}

async function getStatus(name) {
  let result = await makeRequest(
    "GET",
    "https://PowerUI-Chat-4-Backend.skywarspro15.repl.co/getStatus.php?user=" +
      decodeHTML(name)
  );

  return result;
}

function decodeHTML(html) {
  let txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function encodeHTML(html) {
  let encodedStr = html.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });

  return encodedStr;
}

async function loginAccount() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let loginStatus = document.getElementById("loginStatus");

  loginStatus.innerHTML = "Logging in...";
  loginStatus.style.color = "white";

  let result = await makeRequest(
    "GET",
    "https://PowerUI-Chat-4-Backend.skywarspro15.repl.co/createAccount.php?user=" +
      encodeURI(username) +
      "&auth=" +
      encodeURI(password)
  );

  if (result.trim() == "New user") {
    window.location.href = "chats.html?new=True";
    setCookie("username", encodeURI(username));
    setCookie("password", encodeURI(password));
  } else if (result.trim() == "Existing user") {
    window.location.href = "chats.html";
    setCookie("username", encodeURI(username));
    setCookie("password", encodeURI(password));
  } else {
    loginStatus.innerHTML = result;
    loginStatus.style.color = "tomato";
  }
}

function makeRequest(method, url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}

function makeId(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function setCookie(cname, cvalue) {
  const today = new Date();
  const d = new Date();
  d.setTime(today.getTime() + 3600000 * 24 * 15);
  let expires = "expires=" + d.toUTCString();
  document.cookie =
    cname + "=" + cvalue + ";" + expires + ";path=/; SameSite=Strict";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

document.onkeyup = function (e) {
  if (e.shiftKey && e.key == "K") {
    newUser();
  }
};

window.onresize = function () {
  let chatOpen = document.getElementById("chatOpen");
  let exitButton = document.getElementById("exitButton");

  if (chatOpen.innerHTML == "True" && window.innerWidth <= 600) {
    exitButton.className = "exitChat";
  } else {
    exitButton.className = "exitChat hidden";
  }
};

document.getElementById("messageInput").onkeydown = function (e) {
  if (e.key == "Enter") {
    sendToUser();
  }
};
