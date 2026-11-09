# Kindred Chat

A small, beginner-friendly messaging UI built with plain HTML, CSS, and vanilla JavaScript. It runs entirely in your browser; there is no account, server, or real-time delivery.

## Run with VS Code Live Server

1. Open this project folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `index.html`, then click **Go Live** in the VS Code status bar (or right-click the file and choose **Open with Live Server**).
4. The app opens in your browser. To try the mobile layout, use your browser's responsive/device toolbar.

You can also open `index.html` directly in a modern browser. Live Server is recommended while learning and editing.

## Features

- Seven demo contacts with initials, profile details, conversation previews, timestamps, and unread counts.
- Search contacts by name and select a conversation; opening one marks its unread count as read.
- Send a message with the button or Enter. Shift+Enter inserts a new line.
- Clear an individual conversation after browser confirmation.
- Save messages and the selected contact in browser LocalStorage and restore them on reload.
- Responsive desktop contacts-and-chat layout and a mobile contacts-first layout with a back button.
- Keyboard focus indicators, semantic form controls, screen-reader labels, and useful empty states.
- User message text is rendered as text, not interpreted as HTML.

## Limitations

- This is a front-end demo, not a networked messaging service. Messages do not reach another person and there are no accounts, online indicators, or delivery claims.
- Conversations are stored only in this browser on this device. Clearing browser site data, using private browsing, or disabling LocalStorage may remove or prevent saved changes.
- Demo contact messages are example content. The app does not fetch contacts or sync across devices.
- A message can contain up to 2,000 characters.

## Test checklist

- [ ] Open the page and check that all seven contacts and demo previews are visible.
- [ ] Search for a contact by part of their name, then search for a name with no match.
- [ ] Open an unread contact and verify the badge clears.
- [ ] Send a normal message with Enter and with the Send button.
- [ ] Verify whitespace-only input cannot be sent; use Shift+Enter to create a line break.
- [ ] Open Noor Williams and verify the no-messages state and disabled Clear chat action.
- [ ] Clear a conversation, first canceling and then confirming the confirmation prompt.
- [ ] Reload and verify messages and the selected conversation are restored.
- [ ] At a narrow viewport, verify contacts appear first, opening a person shows the chat, and Back returns to contacts.
- [ ] Use keyboard Tab/Enter to navigate and activate the search, contacts, composer, and buttons.

## Files

```text
chat-app/
├── index.html
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── images/
```
