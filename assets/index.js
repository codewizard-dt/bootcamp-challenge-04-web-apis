let trivia = []
let asked = []
let userAnswer = null

const GameEl = document.getElementById('Game')
const PromptEl = document.getElementById('PlayPrompt')
// const GameEl = GameEl.querySelector('.card')
const ScoreboardEl = document.getElementById('scoreboard')
const TimerEl = ScoreboardEl.querySelector('.timer').querySelector('span')
const HighScoresEl = document.getElementById('HighScores')

const storedScores = localStorage.getItem('HighScores')
const HighScores = storedScores
  ? JSON.parse(storedScores)
  : [{ name: ' Kamala', score: 50 }, { name: ' David', score: 40 }]
function addHighScore(record) {
  HighScores.push(record)
  HighScores.sort((a, b) => b.score - a.score)
  localStorage.setItem('HighScores', JSON.stringify(HighScores))
}

const Game = {
  points: () => Game.count.correct * 15 + (Game.count.incorrect + Game.count.skip) * -5,
  count: {
    correct: 0,
    incorrect: 0,
    skip: 0
  },
  correctGuess: () => { Game.count.correct++; showUpdate(15) },
  incorrectGuess: () => {
    Game.count.incorrect++;
    let i = 0
    const penaltyDecrease = () => {
      if (i < 4) {
        setTimeout(() => {
          Timer.decrease()
          penaltyDecrease()
          i++;
        }, 100)
      }
    }
    penaltyDecrease()
    showUpdate(-5);
  },
  skip: () => { Game.count.skip++; showUpdate(-5) },
}
const Timer = {
  counter: null,
  secondsRemaining: 60 * 2,
  display: () => {
    TimerEl.textContent = Math.floor(Timer.secondsRemaining / 60) + ':' + `${Timer.secondsRemaining % 60}`.padStart(2, '0')
  },
  start: () => {
    Timer.display()
    Timer.counter = setInterval(Timer.decrease, 1000)
  },
  decrease: () => {
    if (!Timer.secondsRemaining) {
      Timer.timeout()
      return
    }
    Timer.secondsRemaining--
    Timer.display()
  },
  timeout: () => {
    clearInterval(Timer.counter)
    GameEl.style.display = 'none'
    HighScoresEl.style.display = 'block'
  }
}

/**
 * Fetch trivia and update on success
 */
async function getTrivia() {
  try {
    const response = await fetch('https://api.javascript-trivia.com/')
    let { questions } = await response.json()
    trivia = [...questions]
  } catch (error) {
    console.log(error)
    trivia = new Array(25).fill({
      question: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Labore iste possimus excepturi officiis aliquam, beatae doloribus eos vero minima. Quae, voluptatem repudiandae sint aliquam sequi iste consequuntur distinctio quas veritatis.',
      codeSnippet: 'abc bbd',
      answerOptions: { A: 'answer A', B: 'answer B', C: "Answer C", D: 'Answer D' },
      correctAnswer: 'A',
      answerExplanation: 'Sorry you\'r just so wrong'
    })
  }
}
getTrivia()

/**
 * Click event listener for #StartBtn
 */
function StartGame(ev) {
  ev.preventDefault()
  Timer.start()
  GameEl.style.display = 'block'
  PromptEl.style.display = 'none'
  displayNextQuestion()
}
document.getElementById('StartBtn').addEventListener('click', StartGame)

/**
 * Elements and function to update scores
 */
const highscoreLink = ScoreboardEl.querySelector('.highscores')
const correctCount = ScoreboardEl.querySelector('.correctGuesses').querySelector('span')
const incorrectCount = ScoreboardEl.querySelector('.incorrectGuesses').querySelector('span')
const skipCount = ScoreboardEl.querySelector('.skips').querySelector('span')
const points = ScoreboardEl.querySelector('.points').querySelector('span')
function updateCounts() {
  const { correct, incorrect, skip } = Game.count
  correctCount.textContent = correct
  incorrectCount.textContent = incorrect
  skipCount.textContent = skip
  points.textContent = Game.points()
}

/**
 * Selects a random question that hasn't been answered yet.
 * Removes the question from the `trivia` array
 * @returns a question object from trivia array
 */
function getNext() {
  return trivia.splice(Math.floor(Math.random() * trivia.length), 1)[0]
}
/**
 * Returns the current question
 * @returns currently displayed question
 */
function getCurrent() {
  return asked[asked.length - 1]
}
/**
 * Handles the click of an answer choice
 * @param value numeric answer choice
 */
function checkAnswer(value) {
  if (value) userAnswer = value
  const { correctAnswer } = getCurrent()
  if (userAnswer === correctAnswer) isCorrect()
  else isIncorrect()
  updateCounts()
}
function showUpdate(num) {
  const update = document.createElement('div')
  if (num > 0) update.textContent = "+"
  update.textContent += num
  update.classList.add('update')
  update.classList.add(num > 0 ? 'positive' : 'negative')
  points.parentElement.appendChild(update)
  setTimeout(() => update.classList.add('fade'), 1500)
  setTimeout(() => update.remove(), 2000);
}

/**
 * Handles all actions when a correct answer is clicked
 */
function isCorrect() {
  // Tracks game stats
  Game.correctGuess()
  // Render DOM changes
  answerHeader.textContent = "You got it!"
  // Displays next question
  setTimeout(displayNextQuestion, 1500)
}

/**
 * Handles all actions when an incorrect answer is clicked
 */
function isIncorrect() {
  // Tracks game stats
  Game.incorrectGuess()
  // Renders page changes
  answer.classList.remove('hidden')
  answerHeader.textContent = "Wrong! Here's some help..."
  // Displays explanation of correct answer (but does not provide the answer)
  answerContent.innerHTML = renderAnswerText(getCurrent().answerExplanation)
}

/**
 * DOM elements
 */
const text = GameEl.querySelector('.text')
const choices = GameEl.querySelector('.choices')
const snippet = GameEl.querySelector('.snippet')
const answer = document.querySelector('.answer')
const answerHeader = answer.querySelector('h3')
const answerContent = answer.querySelector('.content')
const highScoresList = HighScoresEl.querySelector('.scores')

/**
 * Displays next question
 */
function displayNextQuestion() {
  // Retrieves and removes random question from `trivia` array
  const next = getNext()
  const {
    question,
    codeSnippet,
    answerOptions,
  } = next

  // Adds the question to `asked` array
  asked.push(next)

  // Renders DOM changes
  text.textContent = question
  snippet.innerHTML = codeSnippet
  choices.innerHTML = ''
  for (let key of ['A', 'B', 'C', 'D']) {
    if (!answerOptions[key]) continue
    choices.append(getAnswerOption(key, answerOptions[key]))
  }
  answer.classList.add('hidden')
}


/**
 * @returns an html content for the inside of an answer choice
 */
function getLiHtml(key, value) {
  return `<label>${key}</label><span>${renderAnswerText(value)}</span>`
}
function updateHighScores() {
  highScoresList.innerHTML = ''
  for (let { name, score } of HighScores) {
    let ele = document.createElement('li')
    ele.innerHTML = getLiHtml(name, score)
    highScoresList.append(ele)
  }
}
/**
 * 
 * @param {string} key A | B | C | D
 * @param {string} value answer choice text
 * @returns a freestanding `<li>` element (not added to DOM yet)
 */
function getAnswerOption(key, value) {
  const ele = document.createElement('li')
  ele.innerHTML = getLiHtml(key, value)
  ele.addEventListener('click', () => {
    resetLiClass()
    ele.classList.add('active')
    checkAnswer(key)
  })
  return ele
}
/**
 * Removes `active` class from all LIs
 */
function resetLiClass() {
  GameEl.querySelectorAll('li').forEach(li => li.classList.remove('active'))
}

/**
 * Finds `backticks` and wraps them with span.backtick
 * @param {string} text from API
 * @returns string
 */
function renderAnswerText(text) {
  return text.replace(/(`[^`]*`)/g, str => `<code class='backtick'>${str.slice(1, str.length - 1)}</code>`)
}

/**
 * Handles submit event
 * @param  ev submit event  
 */
function submit(ev) {
  ev.preventDefault()
  if (!userAnswer) {
    answerContent.innerHTML = 'Select an answer'
    return
  }
  const { answerExplanation, correctAnswer } = getCurrent()
  answerContent.innerHTML = getHtml(correctAnswer, answerExplanation)
  answer.classList.remove('hidden')
}
GameEl.addEventListener('submit', submit)

function skip(ev) {
  ev.preventDefault()
  Game.skip()
  console.log(Game.count.skip)
  displayNextQuestion()
  updateCounts()
}
GameEl.querySelector('button.skip').addEventListener('click', skip)

// SHOW RESULT

// SHOW BUTTON TO NEXT QUESTION

