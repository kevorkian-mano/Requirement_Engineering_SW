import * as Phaser from 'phaser';

export class AlgebraExplorerGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private currentQuestion: any = null;
  private questionText!: Phaser.GameObjects.Text;
  private answerInput!: HTMLInputElement;
  private questions: any[] = [];
  private questionIndex: number = 0;
  private correctAnswers: number = 0;
  private onScoreUpdate?: (score: number) => void;

  constructor() {
    super({ key: 'AlgebraExplorerGame' });
  }

  init(data?: { onScoreUpdate?: (score: number) => void }) {
    if (data && data.onScoreUpdate) {
      this.onScoreUpdate = data.onScoreUpdate;
    }
  }

  create() {
    // Get callback from scene data if available
    const callback = this.data.get('onScoreUpdate');
    if (callback) {
      this.onScoreUpdate = callback;
    }

    // Background
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
    
    // Title
    this.add.text(400, 50, 'Algebra Explorer', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 50, 'Score: 0', {
      fontSize: '24px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
    });

    // Generate questions
    this.generateQuestions();
    this.showQuestion();

    // Instructions
    this.add.text(400, 550, 'Solve the equations! Type your answer and press Enter', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
  }

  generateQuestions() {
    this.questions = [
      { question: 'x + 5 = 12', answer: 7, equation: (x: number) => x + 5 === 12 },
      { question: '2x = 10', answer: 5, equation: (x: number) => 2 * x === 10 },
      { question: 'x - 3 = 8', answer: 11, equation: (x: number) => x - 3 === 8 },
      { question: '3x + 2 = 14', answer: 4, equation: (x: number) => 3 * x + 2 === 14 },
      { question: 'x / 2 = 6', answer: 12, equation: (x: number) => x / 2 === 6 },
      { question: '2x - 5 = 7', answer: 6, equation: (x: number) => 2 * x - 5 === 7 },
      { question: 'x + 10 = 20', answer: 10, equation: (x: number) => x + 10 === 20 },
      { question: '4x = 24', answer: 6, equation: (x: number) => 4 * x === 24 },
      { question: 'x - 7 = 15', answer: 22, equation: (x: number) => x - 7 === 15 },
      { question: '5x + 3 = 28', answer: 5, equation: (x: number) => 5 * x + 3 === 28 },
    ];
  }

  showQuestion() {
    if (this.questionIndex >= this.questions.length) {
      this.endGame();
      return;
    }

    this.currentQuestion = this.questions[this.questionIndex];

    // Clear previous question
    if (this.questionText) {
      this.questionText.destroy();
    }
    if (this.answerInput) {
      this.answerInput.remove();
    }

    // Show question
    this.questionText = this.add.text(400, 250, `Solve for x:\n${this.currentQuestion.question}`, {
      fontSize: '32px',
      color: '#FFE66D',
      fontFamily: 'Arial',
      align: 'center',
    }).setOrigin(0.5);

    // Create input field
    this.answerInput = document.createElement('input');
    this.answerInput.type = 'number';
    this.answerInput.style.position = 'absolute';
    this.answerInput.style.left = '50%';
    this.answerInput.style.top = '50%';
    this.answerInput.style.transform = 'translate(-50%, -50%)';
    this.answerInput.style.width = '200px';
    this.answerInput.style.height = '50px';
    this.answerInput.style.fontSize = '24px';
    this.answerInput.style.textAlign = 'center';
    this.answerInput.style.border = '3px solid #4ECDC4';
    this.answerInput.style.borderRadius = '10px';
    this.answerInput.style.backgroundColor = '#ffffff';
    this.answerInput.placeholder = 'Enter answer';
    this.answerInput.focus();

    const gameContainer = this.game.canvas.parentElement;
    if (gameContainer) {
      gameContainer.style.position = 'relative';
      gameContainer.appendChild(this.answerInput);
    }

    // Handle answer submission
    this.answerInput.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.checkAnswer();
      }
    };
  }

  checkAnswer() {
    const userAnswer = parseFloat(this.answerInput.value);
    
    if (userAnswer === this.currentQuestion.answer) {
      // Correct!
      this.correctAnswers++;
      this.score += 10;
      this.updateScore();
      
      // Show feedback
      const feedback = this.add.text(400, 400, '✓ Correct! +10 points', {
        fontSize: '28px',
        color: '#06D6A0',
        fontFamily: 'Arial',
      }).setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        feedback.destroy();
        this.questionIndex++;
        this.showQuestion();
      });
    } else {
      // Wrong
      const feedback = this.add.text(400, 400, `✗ Wrong! Answer: ${this.currentQuestion.answer}`, {
        fontSize: '28px',
        color: '#FF6B6B',
        fontFamily: 'Arial',
      }).setOrigin(0.5);

      this.time.delayedCall(1500, () => {
        feedback.destroy();
        this.questionIndex++;
        this.showQuestion();
      });
    }

    this.answerInput.value = '';
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  endGame() {
    if (this.answerInput) {
      this.answerInput.remove();
    }

    const completionRate = (this.correctAnswers / this.questions.length) * 100;
    const finalScore = this.score + (completionRate > 80 ? 50 : 0); // Bonus for high completion

    this.add.rectangle(400, 300, 600, 400, 0x2a2a4e, 0.95);
    this.add.text(400, 200, 'Game Complete!', {
      fontSize: '40px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 280, `Final Score: ${finalScore}`, {
      fontSize: '32px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 340, `Correct: ${this.correctAnswers}/${this.questions.length}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    if (this.onScoreUpdate) {
      this.onScoreUpdate(finalScore);
    }
  }
}

