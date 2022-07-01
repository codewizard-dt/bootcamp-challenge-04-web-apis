# Javascript Quiz

## Landing Page

The landing page displays all important info about the game. It allows a chance to view high scores before playing, and displays a button that starts the game

## Game Play
Once the user begins the game it's a race against the clock.  

> ### Rules
> - 2 minute countdown
> - +15 points for correct answer
> - -5 points and -5 seconds for an incorrect answer
> - -5 points to skip a question

> ### Questions
> - 150 questions retrieved from a free api (https://api.javascript-trivia.com/)
> - A correct answer moves immediately to the next question
> - An incorrect answer provides additional information but does not move to the next question
> - User can skip any question for a penalty

> ### Timer
> - Starts at 120 seconds
> - Exacts penalties for incorrect answers
> - When timer runs out, user is taken immediately to High Scores screen
> - If a user clicks on `See High Scores` during gameplay, they forfeit the rest of their remaining time, but are prompted for their name if they got a high score

## High Scores
If the user is in the top 10 high scores, they are prompted for their name
- Scores are stored in local storage for persistance
- The list has a default of ten fake top scores
- After user adds their name, their score is highlighted
- Presents a button to replay the game again

# Demo
