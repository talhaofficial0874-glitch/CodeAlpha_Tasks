def get_bot_response(user_input):
    """Rule-based logic using if-elif."""
    user_input = user_input.lower().strip()
    
    if user_input in ["hello", "hi", "hey"]:
        return "Hi!"
    elif user_input in ["how are you", "how are you doing"]:
        return "I'm fine, thanks!"
    elif user_input in ["bye", "goodbye"]:
        return "Goodbye!"
    else:
        return "I'm not sure how to respond to that."

def start_chat():
    """Main loop for console-based chat (demonstrating while loops and I/O)."""
    print("AI Assistant: Hello! (Type 'bye' to exit)")
    
    # Loop to continuously get input
    while True:
        # Input/Output
        user_msg = input("You: ")
        
        reply = get_bot_response(user_msg)
        print(f"AI Assistant: {reply}")
        
        if reply == "Goodbye!":
            break

if __name__ == "__main__":
    start_chat()
