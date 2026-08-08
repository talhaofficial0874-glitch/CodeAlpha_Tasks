const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

const botAvatarSrc = "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=a855f7";
const userAvatarSrc = "https://api.dicebear.com/7.x/avataaars/svg?seed=User&backgroundColor=6366f1";

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

function getTimestamp() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Clear input
    userInput.value = '';

    // Add user message
    addMessage(text, 'user', userAvatarSrc);

    // Add typing indicator
    const typingElement = showTypingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        
        // Remove typing indicator and add bot response
        setTimeout(() => {
            typingElement.remove();
            addMessage(data.reply, 'bot', botAvatarSrc);
        }, 800 + Math.random() * 600); // More realistic delay

    } catch (error) {
        typingElement.remove();
        addMessage("Oops! I'm having trouble connecting to the server.", 'bot', botAvatarSrc);
    }
}

function addMessage(text, sender, avatarSrc) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${sender}-wrapper`;
    
    const time = getTimestamp();
    
    const html = `
        <img src="${avatarSrc}" alt="${sender}" class="message-avatar">
        <div class="message-content">
            <div class="message ${sender}-message">
                ${text}
            </div>
            <span class="timestamp">${time}</span>
        </div>
    `;
    
    wrapper.innerHTML = html;
    chatMessages.appendChild(wrapper);
    scrollToBottom();
}

function showTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper bot-wrapper`;
    
    const html = `
        <img src="${botAvatarSrc}" alt="bot" class="message-avatar">
        <div class="message-content">
            <div class="typing-wrapper">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    wrapper.innerHTML = html;
    chatMessages.appendChild(wrapper);
    scrollToBottom();
    return wrapper;
}

function scrollToBottom() {
    // Smooth scroll to bottom
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}
