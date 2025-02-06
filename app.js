// Global variables
let translations = {};
let currentLanguage = "en";
let autoScrollEnabled = true;

// DOM elements
const chatContainer = document.querySelector(".chat-container");
const modelSelect = document.getElementById("model-select");
const enterCheckbox = document.getElementById("enterSend");
const modelMessage = document.getElementById("model-message");
const promptInput = document.getElementById("prompt");
const sendButton = document.getElementById("sendButton");
const responseDiv = document.getElementById("response");
const thinkDiv = document.getElementById("thinkDiv");
const enterLabel = document.getElementById("enterLabel");

// Initialize the application
async function initializeApp() {
  await loadTranslations();
  setLanguage();
  loadModels("models.txt");
  loadSettings();
  setupEventListeners();
  setTimeout(maintainScroll, 100);
}

// Load translations from JSON file
async function loadTranslations() {
  try {
    const response = await fetch("translations.json");
    translations = await response.json();
  } catch (error) {
    console.error("Error loading translations:", error);
  }
}

// Set the application language
function setLanguage() {
  // Get browser language or fallback to English
  const browserLang = navigator.language.split("-")[0];
  currentLanguage = translations[browserLang] ? browserLang : "en";

  // Update all text content
  document.title = translations[currentLanguage].title;
  promptInput.placeholder = translations[currentLanguage].placeholder;
  sendButton.textContent = translations[currentLanguage].send;
  enterLabel.textContent = translations[currentLanguage].enterToSend;
}

// Load available models
async function loadModels(filePath) {
  try {
    const response = await fetch(`${filePath}?_=${new Date().getTime()}`);
    if (!response.ok) throw new Error(`Error loading models from ${filePath}`);

    const text = await response.text();
    const models = text.split("\n").filter((line) => line.trim() !== "");

    modelSelect.innerHTML = "";

    if (models.length === 0) {
      modelSelect.innerHTML = `<option value="">${translations[currentLanguage].noModelsAvailable}</option>`;
      showWarningMessage(translations[currentLanguage].emptyModelsFile);
      return;
    }

    modelMessage.classList.remove("warning");

    models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model.trim();
      option.text = model.trim();
      modelSelect.appendChild(option);
    });

    // Set selected model
    const savedModel = localStorage.getItem("selectedModel");
    if (savedModel && models.includes(savedModel.trim())) {
      modelSelect.value = savedModel;
    } else if (models.length > 0) {
      modelSelect.value = models[0].trim();
      localStorage.setItem("selectedModel", models[0].trim());
    }

    updateModelMessage();
  } catch (error) {
    console.error("Error loading models:", error);
    modelSelect.innerHTML = `<option value="">${translations[currentLanguage].noModelsAvailable}</option>`;
    showWarningMessage(translations[currentLanguage].errorLoadingModels);
  }
}

// Show warning message
function showWarningMessage(message) {
  modelMessage.innerHTML = `<span class="warning-icon">⚠️</span> ${message}`;
  modelMessage.classList.add("warning");
}

// Update model command message
function updateModelMessage() {
  const selectedModel = modelSelect.value;
  if (!selectedModel) return;

  modelMessage.classList.remove("warning");
  modelMessage.innerHTML = `${translations[currentLanguage].modelCommandPrefix} <span class="highlighted-command">ollama run ${selectedModel}</span>`;
}

// Load user settings
function loadSettings() {
  const enterSetting = localStorage.getItem("enterSend");
  enterCheckbox.checked = enterSetting !== "false";
}

// Set up event listeners
function setupEventListeners() {
  modelSelect.addEventListener("change", () => {
    localStorage.setItem("selectedModel", modelSelect.value);
    updateModelMessage();
  });

  enterCheckbox.addEventListener("change", (e) => {
    localStorage.setItem("enterSend", e.target.checked);
  });

  chatContainer.addEventListener("scroll", () => {
    const tolerance = 50;
    const atBottom =
      chatContainer.scrollHeight - chatContainer.scrollTop <=
      chatContainer.clientHeight + tolerance;
    autoScrollEnabled = atBottom;
  });

  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && enterCheckbox.checked && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  sendButton.addEventListener("click", send);
}

// Maintain scroll position
function maintainScroll() {
  if (autoScrollEnabled) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Add copy button to code blocks
function addCopyButton(pre) {
  const button = document.createElement("button");
  button.className = "copy-button";
  button.textContent = translations[currentLanguage].copy;

  button.addEventListener("click", async () => {
    const code = pre.querySelector("code");
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = translations[currentLanguage].copied;
      button.classList.add("copied");
      setTimeout(() => {
        button.textContent = translations[currentLanguage].copy;
        button.classList.remove("copied");
      }, 2000);
    } catch (err) {
      console.error("Error copying:", err);
      button.textContent = translations[currentLanguage].error;
    }
  });

  pre.appendChild(button);
}

// Send message to API
async function send() {
  const prompt = promptInput.value;

  // Show waiting messages
  responseDiv.innerHTML = `<em>${translations[currentLanguage].waiting}</em>`;
  thinkDiv.innerHTML = `<em>${translations[currentLanguage].thinking}</em>`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelSelect.value,
        prompt: prompt,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let think = false;
    let accumulator = "";
    let isInCodeBlock = false;
    let codeBlockContent = "";
    let isFirstResponse = true;

    // Clear thinkDiv
    thinkDiv.innerHTML = "";

    // Helper function to append text
    const appendText = (text, isThinking) => {
      const targetDiv = isThinking ? thinkDiv : responseDiv;

      // Clear waiting message on first real response
      if (!isThinking && isFirstResponse) {
        responseDiv.innerHTML = "";
        isFirstResponse = false;
      }

      if (isInCodeBlock) {
        codeBlockContent += text;
      } else {
        targetDiv.insertAdjacentText("beforeend", text);
      }
    };

    // Helper function to create code blocks
    const createCodeBlock = (content, isThinking) => {
      const targetDiv = isThinking ? thinkDiv : responseDiv;

      // Clear waiting message on first real response
      if (!isThinking && isFirstResponse) {
        responseDiv.innerHTML = "";
        isFirstResponse = false;
      }

      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = content;
      pre.appendChild(code);
      targetDiv.appendChild(pre);
      hljs.highlightElement(code);
      addCopyButton(pre);
    };

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (isInCodeBlock && codeBlockContent) {
          createCodeBlock(codeBlockContent, think);
        }
        break;
      }

      const textChunk = decoder.decode(value, { stream: true });

      try {
        const json = JSON.parse(textChunk);

        if (json.response === "<think>") {
          think = true;
          continue;
        }
        if (json.response === "</think>") {
          think = false;
          continue;
        }

        accumulator += json.response;

        if (accumulator.includes("```")) {
          const parts = accumulator.split("```");

          if (parts[0]) {
            appendText(parts[0], think);
          }

          if (isInCodeBlock) {
            createCodeBlock(codeBlockContent, think);
            codeBlockContent = "";
            isInCodeBlock = false;
          } else {
            isInCodeBlock = true;
            codeBlockContent = "";
          }

          accumulator = parts[parts.length - 1];
        } else {
          appendText(json.response, think);
          accumulator = "";
        }
      } catch (error) {
        console.log("Error processing chunk:", error);
      }
    }
  } catch (error) {
    responseDiv.innerHTML = `<em>${translations[currentLanguage].requestError}</em>`;
    console.error("Request error:", error);
  }

  maintainScroll();
}

// Initialize the application when the DOM is loaded
window.addEventListener("DOMContentLoaded", initializeApp);
