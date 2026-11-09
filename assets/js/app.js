"use strict";

const STORAGE_KEY = "kindred-chat-state-v1";
const MAX_MESSAGE_LENGTH = 2000;

const contacts = [
  {
    id: "maya",
    name: "Maya Chen",
    initials: "MC",
    color: "#e7e3ff",
    ink: "#5143ad",
    about: "Ceramic artist · Portland",
    messages: [
      { from: "them", text: "Found a tiny bookstore tucked behind the Saturday market. It feels like it was made for you.", minutesAgo: 165 },
      { from: "me", text: "That sounds exactly like my kind of place. Did you get the name?", minutesAgo: 151 },
      { from: "them", text: "Paper Moon Books! I saved the address. We should go next weekend 📚", minutesAgo: 138 }
    ],
    unread: 2
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    initials: "JL",
    color: "#dff2e9",
    ink: "#39785e",
    about: "Product designer · Seattle",
    messages: [
      { from: "them", text: "The new trail was beautiful this morning. Sending you the route I promised!", minutesAgo: 320 },
      { from: "me", text: "Perfect, thank you! Adding it to my weekend list.", minutesAgo: 305 }
    ],
    unread: 0
  },
  {
    id: "amira",
    name: "Amira Patel",
    initials: "AP",
    color: "#ffeadc",
    ink: "#a65d36",
    about: "Home cook · Brooklyn",
    messages: [
      { from: "me", text: "Still thinking about that lemon cake. I need the recipe!", minutesAgo: 1050 },
      { from: "them", text: "I knew you would ask 😄 I'll send it over tonight.", minutesAgo: 1018 }
    ],
    unread: 1
  },
  {
    id: "eli",
    name: "Eli Thompson",
    initials: "ET",
    color: "#deebfa",
    ink: "#436993",
    about: "Music teacher · Austin",
    messages: [
      { from: "them", text: "The kids absolutely loved the playlist you shared. It made rehearsal so much fun.", minutesAgo: 1420 }
    ],
    unread: 0
  },
  {
    id: "sofia",
    name: "Sofia Rivera",
    initials: "SR",
    color: "#f8e3ed",
    ink: "#a14c73",
    about: "Garden enthusiast · Denver",
    messages: [
      { from: "me", text: "How is the balcony garden doing with all this sunshine?", minutesAgo: 1720 },
      { from: "them", text: "Thriving! The little tomatoes are finally turning red 🍅", minutesAgo: 1695 }
    ],
    unread: 0
  },
  {
    id: "noor",
    name: "Noor Williams",
    initials: "NW",
    color: "#f4edcf",
    ink: "#89722d",
    about: "Illustrator · Chicago",
    messages: [],
    unread: 0
  },
  {
    id: "theo",
    name: "Theo Martin",
    initials: "TM",
    color: "#e5e6f4",
    ink: "#5b608d",
    about: "Weekend cyclist · Boston",
    messages: [
      { from: "them", text: "Coffee after the ride on Sunday? I found a spot with a patio.", minutesAgo: 3100 },
      { from: "me", text: "Absolutely. Send me the details when you get a chance!", minutesAgo: 3074 }
    ],
    unread: 3
  }
];

const appShell = document.querySelector("#appShell");
const contactList = document.querySelector("#contactList");
const contactSearch = document.querySelector("#contactSearch");
const contactEmpty = document.querySelector("#contactEmpty");
const contactCount = document.querySelector("#contactCount");
const emptyConversation = document.querySelector("#emptyConversation");
const emptyHeading = document.querySelector("#emptyHeading");
const emptyCopy = document.querySelector("#emptyCopy");
const emptyAction = document.querySelector("#emptyAction");
const chatView = document.querySelector("#chatView");
const chatPerson = document.querySelector("#chatPerson");
const conversationIntro = document.querySelector("#conversationIntro");
const messageArea = document.querySelector("#messageArea");
const messageList = document.querySelector("#messageList");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearButton");
const backButton = document.querySelector("#backButton");
const composeButton = document.querySelector("#composeButton");
const appNotice = document.querySelector("#appNotice");

let selectedContactId = null;
let noticeTimer = null;
let storageWarningShown = false;

function makeSeedMessages(contact) {
  const now = Date.now();
  return contact.messages.map((message, index) => ({
    id: `${contact.id}-seed-${index}`,
    from: message.from,
    text: message.text,
    timestamp: new Date(now - message.minutesAgo * 60_000).toISOString()
  }));
}

const conversations = Object.fromEntries(
  contacts.map((contact) => [contact.id, {
    messages: makeSeedMessages(contact),
    unread: contact.unread
  }])
);

function showNotice(message, kind = "info", persistent = false) {
  window.clearTimeout(noticeTimer);
  appNotice.textContent = message;
  appNotice.dataset.kind = kind;
  appNotice.hidden = false;
  if (!persistent) {
    noticeTimer = window.setTimeout(() => {
      appNotice.hidden = true;
    }, 4200);
  }
}

function isValidMessage(message) {
  return message !== null
    && typeof message === "object"
    && (message.from === "me" || message.from === "them")
    && typeof message.text === "string"
    && message.text.trim().length > 0
    && message.text.length <= MAX_MESSAGE_LENGTH
    && typeof message.timestamp === "string"
    && Number.isFinite(Date.parse(message.timestamp));
}

function restoreState() {
  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    showNotice("Browser storage is unavailable. New messages will only last until you close this tab.", "error", true);
    return;
  }
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    if (saved === null || typeof saved !== "object" || saved.version !== 1) {
      throw new Error("Unsupported saved data format.");
    }

    for (const contact of contacts) {
      const savedConversation = saved.conversations?.[contact.id];
      if (!savedConversation || !Array.isArray(savedConversation.messages)) continue;

      const messages = savedConversation.messages.filter(isValidMessage).map((message, index) => ({
        id: typeof message.id === "string" ? message.id : `${contact.id}-saved-${index}`,
        from: message.from,
        text: message.text,
        timestamp: new Date(message.timestamp).toISOString()
      }));
      const unread = Number.isInteger(savedConversation.unread) && savedConversation.unread >= 0
        ? savedConversation.unread
        : 0;
      conversations[contact.id] = { messages, unread };
    }

    if (typeof saved.selectedContactId === "string"
      && contacts.some((contact) => contact.id === saved.selectedContactId)) {
      selectedContactId = saved.selectedContactId;
    }
  } catch (error) {
    showNotice("Saved chat data couldn't be read, so this session is starting with the demo conversations.", "error", true);
  }
}

function persistState() {
  const state = {
    version: 1,
    selectedContactId,
    conversations
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (storageWarningShown) {
      storageWarningShown = false;
      showNotice("Saving is available again. Your conversations are stored on this device.");
    }
  } catch (error) {
    storageWarningShown = true;
    showNotice("This browser couldn't save your changes. The conversation remains available until you close this tab.", "error", true);
  }
}

function selectedContact() {
  return contacts.find((contact) => contact.id === selectedContactId) ?? null;
}

function latestMessage(contact) {
  const messages = conversations[contact.id].messages;
  return messages[messages.length - 1] ?? null;
}

function formatTime(timestamp, includeDate = false) {
  const date = new Date(timestamp);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  if (!includeDate && date.toDateString() === new Date().toDateString()) return time;
  const day = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  return `${day} · ${time}`;
}

function createAvatar(contact, className = "avatar") {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.textContent = contact.initials;
  avatar.setAttribute("aria-hidden", "true");
  avatar.style.setProperty("--avatar-bg", contact.color);
  avatar.style.setProperty("--avatar-ink", contact.ink);
  return avatar;
}

function renderContacts() {
  const searchTerm = contactSearch.value.trim().toLocaleLowerCase();
  const filteredContacts = contacts.filter((contact) => contact.name.toLocaleLowerCase().includes(searchTerm));
  contactList.replaceChildren();
  contactCount.textContent = String(filteredContacts.length);
  contactCount.setAttribute("aria-label", `${filteredContacts.length} ${filteredContacts.length === 1 ? "contact" : "contacts"}`);
  contactEmpty.hidden = filteredContacts.length !== 0;
  contactList.hidden = filteredContacts.length === 0;

  for (const contact of filteredContacts) {
    const conversation = conversations[contact.id];
    const message = latestMessage(contact);
    const button = document.createElement("button");
    button.className = "contact-item";
    button.type = "button";
    button.setAttribute("aria-current", String(selectedContactId === contact.id));
    button.setAttribute("aria-label", `${contact.name}${conversation.unread ? `, ${conversation.unread} unread` : ""}`);
    button.addEventListener("click", () => openConversation(contact.id));
    button.append(createAvatar(contact));

    const copy = document.createElement("span");
    copy.className = "contact-copy";
    const topLine = document.createElement("span");
    topLine.className = "contact-topline";
    const name = document.createElement("span");
    name.className = "contact-name";
    name.textContent = contact.name;
    topLine.append(name);

    if (message) {
      const time = document.createElement("time");
      time.className = "contact-time";
      time.dateTime = message.timestamp;
      time.textContent = formatTime(message.timestamp);
      topLine.append(time);
    }

    const bottomLine = document.createElement("span");
    bottomLine.className = "contact-bottomline";
    const preview = document.createElement("span");
    preview.className = "contact-preview";
    preview.textContent = message ? `${message.from === "me" ? "You: " : ""}${message.text}` : "Start a conversation";
    bottomLine.append(preview);

    if (conversation.unread > 0) {
      const badge = document.createElement("span");
      badge.className = "unread-badge";
      badge.textContent = String(conversation.unread);
      badge.setAttribute("aria-hidden", "true");
      bottomLine.append(badge);
    }

    copy.append(topLine, bottomLine);
    button.append(copy);
    contactList.append(button);
  }
}

function renderMessages() {
  const contact = selectedContact();
  if (!contact) return;

  const messages = conversations[contact.id].messages;
  messageList.replaceChildren();
  if (messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "message-empty";
    const mark = document.createElement("span");
    mark.className = "message-empty-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "✦";
    const heading = document.createElement("strong");
    heading.textContent = `Say hello to ${contact.name.split(" ")[0]}`;
    const detail = document.createElement("span");
    detail.textContent = "Your conversation starts with one small hello.";
    empty.append(mark, heading, detail);
    messageList.append(empty);
    return;
  }

  for (const message of messages) {
    const outgoing = message.from === "me";
    const row = document.createElement("div");
    row.className = `message-row ${outgoing ? "outgoing" : "incoming"}`;

    if (!outgoing) row.append(createAvatar(contact, "message-avatar"));

    const content = document.createElement("div");
    content.className = "message-content";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.text;
    const time = document.createElement("time");
    time.className = "message-time";
    time.dateTime = message.timestamp;
    time.textContent = formatTime(message.timestamp, true);
    content.append(bubble, time);
    row.append(content);
    messageList.append(row);
  }
}

function renderConversation() {
  const contact = selectedContact();
  if (!contact) {
    chatView.hidden = true;
    emptyConversation.hidden = false;
    return;
  }

  emptyConversation.hidden = true;
  chatView.hidden = false;
  chatPerson.replaceChildren();
  chatPerson.append(createAvatar(contact));

  const copy = document.createElement("div");
  copy.className = "chat-person-copy";
  const name = document.createElement("h2");
  name.textContent = contact.name;
  const about = document.createElement("p");
  about.textContent = contact.about;
  copy.append(name, about);
  chatPerson.append(copy);

  conversationIntro.textContent = "A conversation between you and " + contact.name.split(" ")[0];
  messageInput.disabled = false;
  sendButton.disabled = messageInput.value.trim().length === 0;
  clearButton.disabled = conversations[contact.id].messages.length === 0;
  messageList.setAttribute("aria-label", `Messages with ${contact.name}`);
  renderMessages();
  messageArea.scrollTop = messageArea.scrollHeight;
}

function renderApp() {
  renderContacts();
  renderConversation();
}

function openConversation(contactId) {
  if (!contacts.some((contact) => contact.id === contactId)) return;
  selectedContactId = contactId;
  conversations[contactId].unread = 0;
  appShell.dataset.view = "conversation";
  renderApp();
  persistState();
}

function returnToContacts() {
  appShell.dataset.view = "contacts";
  contactSearch.focus();
}

function sendMessage() {
  const contact = selectedContact();
  const text = messageInput.value.trim();
  if (!contact || text.length === 0 || text.length > MAX_MESSAGE_LENGTH) {
    sendButton.disabled = true;
    return;
  }

  conversations[contact.id].messages.push({
    id: `${contact.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    from: "me",
    text,
    timestamp: new Date().toISOString()
  });
  messageInput.value = "";
  sendButton.disabled = true;
  renderApp();
  persistState();
  messageInput.focus();
}

function clearConversation() {
  const contact = selectedContact();
  if (!contact || conversations[contact.id].messages.length === 0) return;
  const confirmed = window.confirm(`Clear all messages with ${contact.name}? This can't be undone.`);
  if (!confirmed) return;

  conversations[contact.id].messages = [];
  conversations[contact.id].unread = 0;
  renderApp();
  persistState();
  showNotice(`Chat with ${contact.name} cleared.`);
}

function startConversation() {
  appShell.dataset.view = "contacts";
  contactSearch.focus();
  showNotice("Choose someone from your contacts to open a conversation.");
}

contactSearch.addEventListener("input", renderContacts);
emptyAction.addEventListener("click", returnToContacts);
composeButton.addEventListener("click", startConversation);
backButton.addEventListener("click", returnToContacts);
clearButton.addEventListener("click", clearConversation);
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});
messageInput.addEventListener("input", () => {
  sendButton.disabled = messageInput.value.trim().length === 0;
});
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    messageForm.requestSubmit();
  }
});
document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || target.matches("input, textarea, select"));
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping) {
    event.preventDefault();
    contactSearch.focus();
  }
});

restoreState();
renderApp();
