// DOM Elements
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const quickChips = document.querySelectorAll('.chip');

// API endpoint
const API_URL = 'https://backfire-such-variable.ngrok-free.dev/chatbot';

// Add welcome message
function addWelcomeMessage() {
    const welcomeBubble = document.createElement('div');
    welcomeBubble.classList.add('chat-bubble', 'bot-bubble');
    welcomeBubble.textContent = "Hello! I'm Manomitra, your calm companion. How are you feeling today?";
    chatArea.appendChild(welcomeBubble);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Add a message bubble to the chat
function addMessageBubble(message, isUser = false) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', isUser ? 'user-bubble' : 'bot-bubble');
    bubble.textContent = message;
    chatArea.appendChild(bubble);
    
    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Send message to API
async function sendMessage(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response || "I'm here for you. Let's talk about what you're going through.";
    } catch (error) {
        console.error('Error sending message:', error);
        return "I'm here for you. Let's talk about what you're going through.";
    }
}

// Handle sending a message
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessageBubble(message, true);
    messageInput.value = '';
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-bubble', 'bot-bubble');
    typingIndicator.id = 'typingIndicator';
    typingIndicator.textContent = '...';
    chatArea.appendChild(typingIndicator);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Get bot response
    const botResponse = await sendMessage(message);
    
    // Remove typing indicator and add bot response
    chatArea.removeChild(typingIndicator);
    addMessageBubble(botResponse, false);
}

// Event Listeners
sendButton.addEventListener('click', handleSendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// Quick chip functionality
quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const message = chip.getAttribute('data-message');
        messageInput.value = message;
        handleSendMessage();
    });
});

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    addWelcomeMessage();
});