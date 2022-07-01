let trivia = []
let asked = []
let userAnswer = null

/**
 * High level DOM elements for easy reference
 */
const GameEl = document.getElementById('Game')
const PromptEl = document.getElementById('PlayPrompt')
const ScoreboardEl = document.getElementById('scoreboard')
const TimerEl = ScoreboardEl.querySelector('.timer').querySelector('span')
const HighScoresEl = document.getElementById('HighScores')

/**
 * Get high scores from storage or use the defaults
 */
const storedScores = localStorage.getItem('HighScores')
const defaultScores = [
  { name: 'Queen Latifah', score: 100 },
  { name: 'Kamala', score: 90 },
  { name: 'Jebediah', score: 80 },
  { name: 'Sharisha', score: 70 },
  { name: 'Rosa', score: 60 },
  { name: 'Muhammad', score: 50 },
  { name: 'David', score: 40 },
  { name: 'Sally', score: 30 },
  { name: 'John', score: 20 },
  { name: 'Donna', score: 10 },
]
let HighScores = storedScores
  ? JSON.parse(storedScores)
  : defaultScores

/**
 * Handles HighScore form submit
 * @param {*} ev click event
 * @returns void
 */
function addHighScore(ev) {
  ev.preventDefault()
  let name = HighScoresEl.querySelector('input').value.trim()
  name = name.slice(0, 1).toUpperCase() + name.slice(1)
  if (!name) { alert('Enter your name!'); return }
  const score = Game.points()
  HighScores.push({ name, score })
  HighScores.sort((a, b) => b.score - a.score)

  localStorage.setItem('HighScores', JSON.stringify(HighScores))
  HighScoresEl.querySelector('form').style.display = 'none'
  renderHighScores({ name, score })
}
/** Adds event listener on high score form */
HighScoresEl.querySelector('button').addEventListener('click', addHighScore)

/**
 * Defines high level game logic
 */
const Game = {
  /** Calculates points */
  points: () => Game.count.correct * 15 + (Game.count.incorrect + Game.count.skip) * -5,
  /** Tracks points */
  count: {
    correct: 0,
    incorrect: 0,
    skip: 0
  },
  /** Handles correct guess */
  correctGuess: () => { Game.count.correct++; showPointsUpdate(15) },
  /** Handles incorrect guess */
  incorrectGuess: () => {
    Game.count.incorrect++;
    showTimePenaltyUpdate()
    // Counter for time penalty
    let i = 0
    /**
     * Starts cascade of setTimeouts that remove 1 s every 100 ms for 5 seconds
     */
    function penaltyDecrease() {
      if (i < 4) {
        setTimeout(() => {
          Timer.decrease()
          penaltyDecrease()
          i++;
        }, 100)
      }
    }
    penaltyDecrease()
    showPointsUpdate(-5)
  },
  /** Handles skip and skip penalty */
  skip: () => { Game.count.skip++; showPointsUpdate(-5) },
  reset: () => {
    trivia = [...trivia, ...asked]
    count = { correct: 0, incorrect: 0, skip: 0 }
    Timer.secondsRemaining = 60 * 2
  }
}

/**
 * Defines timer properties and methods
 */
const Timer = {
  // Placeholder for setInterval
  counter: null,
  // How much time you have to prove yourself
  secondsRemaining: 60 * 2,
  // Update display
  display: () => {
    TimerEl.textContent = Math.floor(Timer.secondsRemaining / 60) + ':' + `${Timer.secondsRemaining % 60}`.padStart(2, '0')
  },
  // Starts timer with setInterval
  start: () => {
    Timer.display()
    Timer.counter = setInterval(Timer.decrease, 1000)
  },
  // Takes off 1 s and updates display
  decrease: () => {
    if (!Timer.secondsRemaining) {
      Timer.timeout()
      return
    }
    Timer.secondsRemaining--
    Timer.display()
  },
  /**
   * Ends game and shows high scores.
   * Shows high score form if you are worthy
   */
  timeout: () => {
    // Stops setInterval
    clearInterval(Timer.counter)
    GameEl.style.display = 'none'
    PromptEl.style.display = 'none'
    HighScoresEl.style.display = 'flex'
    if (isHighScore()) HighScoresEl.querySelector('form').style.display = 'block'
    renderHighScores()
  }
}

/**
 * Fetch trivia from 3rd party API and update on success
 * https://api.javascript-trivia.com/
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
 * Handles click event `.playGame` buttons
 */
function StartGame(ev) {
  ev.preventDefault()
  Game.reset()
  Timer.start()
  GameEl.style.display = 'block'
  PromptEl.style.display = 'none'
  HighScoresEl.style.display = 'none'
  displayNextQuestion()
}
document.querySelectorAll('.playGame').forEach(btn => btn.addEventListener('click', StartGame))

function ShowHighScore(ev) {
  ev.preventDefault()
  Timer.timeout()
}
document.querySelector('.highscores').addEventListener('click', ShowHighScore)

/**
 * References to elements in the scoreboard that require updating
 */
const highscoreLink = ScoreboardEl.querySelector('.highscores')
const correctCount = ScoreboardEl.querySelector('.correctGuesses').querySelector('span')
const incorrectCount = ScoreboardEl.querySelector('.incorrectGuesses').querySelector('span')
const skipCount = ScoreboardEl.querySelector('.skips').querySelector('span')
const points = ScoreboardEl.querySelector('.points').querySelector('span')
/**
 * Renders DOM updates related to points
 */
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
 * @param value alphabetic answer choice
 */
function checkAnswer(value) {
  if (!value) throw new Error('Can\'t check value if not provided lol')
  userAnswer = value
  const { correctAnswer } = getCurrent()
  if (userAnswer === correctAnswer) isCorrect()
  else isIncorrect()
  updateCounts()
}

/**
 * Displays an update absolutely positioned under the parent.
 * After 1s fades element out, and after 1.5s removes element from DOM
 * @param {string} text the message
 * @param {HTMLELement} parent the parent container
 * @param {string} className 'positive' | 'negative'
 */
function createUpdate(text, parent, className = "negative") {
  const update = document.createElement('div')
  update.textContent = text
  update.classList.add('update')
  update.classList.add(className)
  let { position } = parent.style
  if (position === 'static') parent.style.position = 'relative'
  parent.appendChild(update)
  setTimeout(() => update.classList.add('fade'), 1000)
  setTimeout(() => update.remove(), 1500);
}
/**
 * Shows a positive (green) or negative (red) point change
 * @param {number} num points gained or lost
 */
function showPointsUpdate(num) {
  let message = num > 0 ? "+" : ""
  message += num
  createUpdate(message, points.parentElement, num > 0 ? 'positive' : 'negative')
}
/**
 * Shows a time penalty for an incorrect answer
 */
function showTimePenaltyUpdate() {
  createUpdate('-5', TimerEl.parentElement)
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
  setTimeout(displayNextQuestion, 500)
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
 * DOM elements related to updating the current trivia question
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
 * @returns html string representing a `label` and a `value`
 */
function getLiHtml(key, value) {
  return `<label>${key}</label><span>${renderAnswerText(value)}</span>`
}
/**
 * Creates an `li` element for a single answer option
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
 * Renders current list of high scores
 */
function renderHighScores(currentRecord = {}) {
  highScoresList.innerHTML = ''
  for (let { name, score } of HighScores) {
    let ele = document.createElement('li')
    ele.innerHTML = getLiHtml(name, score)
    if (currentRecord.name == name && currentRecord.score == score) ele.classList.add('active')
    highScoresList.append(ele)
  }
}

/**
 * Determines if current score is worthy of glory
 * @returns boolean
 */
function isHighScore() {
  // True if score is greater than the lowest high score, false if not
  if (Game.points() > Math.min(...HighScores.map(record => record.score))) return true
  else return false
}

/**
 * Finds `backticks` and wraps them with `code.backtick`.
 * @param {string} text from API
 * @returns string
 */
function renderAnswerText(text) {
  text = `${text}`
  return text.replace(/(`[^`]*`)/g, str => `<code class='backtick'>${str.slice(1, str.length - 1)}</code>`)
}

/**
 * Skips current question and displays next question.
 * @param {*} ev click event
 */
function skip(ev) {
  ev.preventDefault()
  Game.skip()
  console.log(Game.count.skip)
  displayNextQuestion()
  updateCounts()
}
GameEl.querySelector('button.skip').addEventListener('click', skip)