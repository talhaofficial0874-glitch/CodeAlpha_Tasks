from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

def get_bot_response(user_input):
    """Rule-based logic using if-elif."""
    user_input = user_input.lower().strip()
    
    if user_input in ["hello", "hi", "hey"]:
        return "Hi! 👋 I'm your professional AI assistant. How can I help you today?"
    elif user_input in ["how are you", "how are you doing"]:
        return "I'm fine, thanks! I typically reply instantly. How can I assist you?"
    elif user_input in ["bye", "goodbye"]:
        return "Goodbye! Have a great day ahead."
    else:
        return "I'm not sure how to respond to that."

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    # Input/Output handling via API
    user_message = request.json.get('message', '')
    bot_reply = get_bot_response(user_message)
    return jsonify({'reply': bot_reply})

if __name__ == '__main__':
    # Listen continuously for API requests on port 5001
    app.run(debug=True, port=5001)
