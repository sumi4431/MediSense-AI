var BACKEND_URL = "http://127.0.0.1:5000/api/chat";

var MODES = {
  symptoms: {
    icon: "🩺",
    title: "Symptom Checker",
    sub: "Describe what you feel and I will help assess it",
    placeholder: "Describe your symptoms here...",
    welcome: "Describe your symptoms and I will help you understand what might be going on.",
    suggestions: ["I have a headache and fever", "My chest feels tight when I breathe", "I have had a sore throat for 3 days"]
  },
  tips: {
    icon: "💊",
    title: "Health Tips",
    sub: "Get personalised lifestyle and wellness advice",
    placeholder: "Ask about diet, exercise, sleep, mental health...",
    welcome: "Ask me anything about staying healthy.",
    suggestions: ["How much water should I drink daily?", "What foods help boost immunity?", "How can I improve my sleep quality?"]
  },
  emergency: {
    icon: "🚨",
    title: "Emergency Guide",
    sub: "Know when to seek urgent medical attention",
    placeholder: "Describe the situation...",
    welcome: "Describe the situation and I will tell you whether it needs emergency care or can wait.",
    suggestions: ["Someone is having chest pains", "A child swallowed something unknown", "Someone fainted and will not wake up"]
  },
  qa: {
    icon: "📋",
    title: "Health Q&A",
    sub: "General medical questions answered clearly",
    placeholder: "Ask any health or medical question...",
    welcome: "Ask me any general health question.",
    suggestions: ["What is hypertension?", "How does the immune system fight viruses?", "What is the difference between Type 1 and Type 2 diabetes?"]
  }
};

var currentMode = "symptoms";
var conversationHistory = [];
var isLoading = false;

function switchMode(btn) {
  var buttons = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }
  btn.classList.add("active");
  currentMode = btn.getAttribute("data-mode");
  conversationHistory = [];
  document.getElementById("clear-btn").classList.remove("show");
  var m = MODES[currentMode];
  document.getElementById("mode-icon").textContent = m.icon;
  document.getElementById("mode-title").textContent = m.title;
  document.getElementById("mode-sub").textContent = m.sub;
  document.getElementById("user-input").placeholder = m.placeholder;
  document.getElementById("chat-box").innerHTML = buildWelcome(m);
}

function buildWelcome(m) {
  var html = '<div class="welcome" id="welcome">';
  html += '<div class="welcome-emoji">' + m.icon + '</div>';
  html += '<h2>' + m.title + '</h2>';
  html += '<p>' + m.welcome + '</p>';
  html += '<div class="suggestions">';
  for (var i = 0; i < m.suggestions.length; i++) {
    html += '<button type="button" class="suggest-btn" onclick="fillInput(this)">' + m.suggestions[i] + '</button>';
  }
  html += '</div></div>';
  return html;
}

function fillInput(btn) {
  document.getElementById("user-input").value = btn.textContent;
  document.getElementById("user-input").focus();
}

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
    return false;
  }
}

function sendMessage() {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  var userInput = document.getElementById("user-input");
  var text = userInput.value.trim();
  if (!text || isLoading) return false;

  var welcome = document.getElementById("welcome");
  if (welcome) welcome.remove();

  document.getElementById("clear-btn").classList.add("show");
  userInput.value = "";
  isLoading = true;
  document.getElementById("send-btn").disabled = true;

  addMessage("user", text);
  conversationHistory.push({ role: "user", content: text });

  var typingEl = addTyping();

  var xhr = new XMLHttpRequest();
  xhr.open("POST", BACKEND_URL, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function() {
    typingEl.remove();
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      if (data.error) {
        addError("Server error: " + data.error);
      } else {
        addMessage("bot", data.reply);
        conversationHistory.push({ role: "assistant", content: data.reply });
      }
    } else {
      addError("Server returned an error. Status: " + xhr.status);
    }
    isLoading = false;
    document.getElementById("send-btn").disabled = false;
    scrollDown();
  };

  xhr.onerror = function() {
    typingEl.remove();
    addError("Cannot connect to server. Make sure backend is running with: python app.py");
    isLoading = false;
    document.getElementById("send-btn").disabled = false;
    scrollDown();
  };

  xhr.send(JSON.stringify({ mode: currentMode, messages: conversationHistory }));
  return false;
}

function clearChat() {
  conversationHistory = [];
  document.getElementById("clear-btn").classList.remove("show");
  document.getElementById("chat-box").innerHTML = buildWelcome(MODES[currentMode]);
}

function addMessage(role, text) {
  var div = document.createElement("div");
  div.className = "message " + role;
  var avatar = role === "bot" ? "✚" : "👤";
  div.innerHTML = '<div class="avatar">' + avatar + '</div><div class="bubble">' + formatText(text) + '</div>';
  document.getElementById("chat-box").appendChild(div);
  scrollDown();
}

function addTyping() {
  var div = document.createElement("div");
  div.className = "typing";
  div.innerHTML = '<div class="tdot"></div><div class="tdot"></div><div class="tdot"></div>';
  document.getElementById("chat-box").appendChild(div);
  scrollDown();
  return div;
}

function addError(msg) {
  var div = document.createElement("div");
  div.className = "error-box";
  div.textContent = "Error: " + msg;
  document.getElementById("chat-box").appendChild(div);
  scrollDown();
}

function formatText(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\n/g, "<br/>");
  return text;
}

function scrollDown() {
  var chatBox = document.getElementById("chat-box");
  chatBox.scrollTop = chatBox.scrollHeight;
}

window.onload = function() {
  document.getElementById("send-btn").addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
    return false;
  });
};