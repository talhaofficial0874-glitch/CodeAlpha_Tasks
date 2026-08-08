import random
import os
import sys

# Define a nice professional color theme using ANSI escape codes
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# The 7 states of the hangman (0 incorrect guesses to 6 incorrect guesses)
HANGMAN_PICS = [
    f"""
      {Colors.BLUE}┌───┐{Colors.ENDC}
      {Colors.BLUE}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
    {Colors.BLUE}=========
    """,
    f"""
      {Colors.BLUE}┌───┐{Colors.ENDC}
      {Colors.BLUE}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
      {Colors.WARNING}O{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
    {Colors.BLUE}=========
    """,
    f"""
      {Colors.BLUE}┌───┐{Colors.ENDC}
      {Colors.BLUE}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
      {Colors.WARNING}O{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
      {Colors.WARNING}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
    {Colors.BLUE}=========
    """,
    f"""
      {Colors.BLUE}┌───┐{Colors.ENDC}
      {Colors.BLUE}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
      {Colors.WARNING}O{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
     {Colors.WARNING}/│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
    {Colors.BLUE}=========
    """,
    f"""
      {Colors.BLUE}┌───┐{Colors.ENDC}
      {Colors.BLUE}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
      {Colors.WARNING}O{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
     {Colors.WARNING}/│\\{Colors.ENDC}  {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
    {Colors.BLUE}=========
    """,
    f"""
      {Colors.BLUE}┌───┐{Colors.ENDC}
      {Colors.BLUE}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
      {Colors.WARNING}O{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
     {Colors.WARNING}/│\\{Colors.ENDC}  {Colors.BLUE}│{Colors.ENDC}
     {Colors.WARNING}/{Colors.ENDC}    {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
    {Colors.BLUE}=========
    """,
    f"""
      {Colors.BLUE}┌───┐{Colors.ENDC}
      {Colors.BLUE}│{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
      {Colors.FAIL}O{Colors.ENDC}   {Colors.BLUE}│{Colors.ENDC}
     {Colors.FAIL}/│\\{Colors.ENDC}  {Colors.BLUE}│{Colors.ENDC}
     {Colors.FAIL}/ \\{Colors.ENDC}  {Colors.BLUE}│{Colors.ENDC}
          {Colors.BLUE}│{Colors.ENDC}
    {Colors.BLUE}=========
    """
]

def clear_screen():
    # Clears the console depending on the OS
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    print(f"{Colors.HEADER}{Colors.BOLD}")
    print("=======================================")
    print("      🎯 HANGMAN: THE GAME 🎯        ")
    print("=======================================")
    print(f"{Colors.ENDC}")

def play_game():
    # 5 predefined words
    words = ["PYTHON", "DEVELOPER", "PROFESSIONAL", "CHALLENGE", "INTERFACE"]
    
    # Randomly select a word from the list
    word_to_guess = random.choice(words)
    
    guessed_letters = []
    incorrect_guesses = 0
    max_incorrect_guesses = 6

    # Enable ANSI escape codes in Windows terminal
    if os.name == 'nt':
        os.system('color')

    while incorrect_guesses < max_incorrect_guesses:
        clear_screen()
        print_header()
        
        # Print the hangman ASCII art
        print(HANGMAN_PICS[incorrect_guesses])
        
        # Display the word with hidden letters
        display_word = ""
        all_letters_guessed = True
        
        for letter in word_to_guess:
            if letter in guessed_letters:
                display_word += f"{Colors.GREEN}{letter}{Colors.ENDC} "
            else:
                display_word += f"{Colors.CYAN}_{Colors.ENDC} "
                all_letters_guessed = False
                
        print(f"\nWord to guess: {Colors.BOLD}{display_word}{Colors.ENDC}\n")
        
        # Print incorrectly guessed letters
        incorrect_letters = [l for l in guessed_letters if l not in word_to_guess]
        if incorrect_letters:
            print(f"Incorrect guesses: {Colors.FAIL}{', '.join(incorrect_letters)}{Colors.ENDC}")
            
        print(f"Remaining attempts: {Colors.WARNING}{max_incorrect_guesses - incorrect_guesses}{Colors.ENDC}\n")
        
        # Check win condition using if-else
        if all_letters_guessed:
            print(f"{Colors.GREEN}{Colors.BOLD}🎉 CONGRATULATIONS! You guessed the word! 🎉{Colors.ENDC}")
            break
            
        # Get input
        guess = input(f"{Colors.BOLD}Enter a letter:{Colors.ENDC} ").upper().strip()
        
        # Validate input
        if len(guess) != 1 or not guess.isalpha():
            input(f"{Colors.FAIL}Invalid input. Please enter a single letter. (Press Enter to continue){Colors.ENDC}")
            continue
            
        if guess in guessed_letters:
            input(f"{Colors.WARNING}You already guessed '{guess}'. Try another letter. (Press Enter to continue){Colors.ENDC}")
            continue
            
        # Add to list of guessed letters
        guessed_letters.append(guess)
        
        # Check if the guess is incorrect
        if guess not in word_to_guess:
            incorrect_guesses += 1
            
    else:
        # This executes if the while loop completes normally (i.e., we hit 6 max incorrect guesses)
        clear_screen()
        print_header()
        print(HANGMAN_PICS[6])
        print(f"{Colors.FAIL}{Colors.BOLD}💀 GAME OVER! The man has been hanged. 💀{Colors.ENDC}")
        print(f"\nThe word was: {Colors.GREEN}{Colors.BOLD}{word_to_guess}{Colors.ENDC}")

    print(f"\n{Colors.CYAN}Thank you for playing!{Colors.ENDC}")

if __name__ == "__main__":
    play_game()
