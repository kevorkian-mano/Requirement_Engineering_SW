import * as Phaser from 'phaser';

export class PharaohQuestGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private questions: { question: string; options: string[]; correct: number; fact: string }[] = [];
  private currentQuestionIndex: number = 0;
  private questionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Rectangle[] = [];
  private optionLabels: Phaser.GameObjects.Text[] = [];
  private factText!: Phaser.GameObjects.Text;
  private onScoreUpdate?: (score: number) => void;
  private feedbackText!: Phaser.GameObjects.Text;
  private correctCount: number = 0;

  constructor() {
    super({ key: 'PharaohQuestGame' });
  }

  init(data?: { onScoreUpdate?: (score: number) => void }) {
    if (data && data.onScoreUpdate) {
      this.onScoreUpdate = data.onScoreUpdate;
    }
  }

  create() {
    const callback = this.data.get('onScoreUpdate');
    if (callback) {
      this.onScoreUpdate = callback;
    }

    // Background with Egyptian theme
    this.add.rectangle(400, 300, 800, 600, 0xFFE4B5);
    
    // Title
    this.add.text(400, 30, 'Pharaoh Quest', {
      fontSize: '42px',
      color: '#8B4513',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 30, 'Score: 0', {
      fontSize: '24px',
      color: '#FF6B6B',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    // Question text
    this.questionText = this.add.text(400, 120, '', {
      fontSize: '28px',
      color: '#333333',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5);

    // Fact text
    this.factText = this.add.text(400, 200, '', {
      fontSize: '20px',
      color: '#8B4513',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5).setVisible(false);

    // Feedback text
    this.feedbackText = this.add.text(400, 250, '', {
      fontSize: '32px',
      color: '#06D6A0',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5).setVisible(false);

    // Create option buttons
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D];
    const startX = 200;
    const startY = 400;
    const spacing = 200;
    const buttonWidth = 180;
    const buttonHeight = 70;

    for (let i = 0; i < 4; i++) {
      const x = startX + (i % 2) * spacing;
      const y = startY + Math.floor(i / 2) * spacing;

      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, buttonColors[i], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(3, 0xFFFFFF);

      const label = this.add.text(x, y, '', {
        fontSize: '18px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        wordWrap: { width: 160 },
        align: 'center',
      }).setOrigin(0.5);

      button.on('pointerover', () => {
        button.setScale(1.1);
        button.setFillStyle(buttonColors[i], 0.8);
      });
      button.on('pointerout', () => {
        button.setScale(1);
        button.setFillStyle(buttonColors[i], 1);
      });

      this.optionButtons.push(button);
      this.optionLabels.push(label);
    }

    // Initialize questions
    this.questions = [
      {
        question: 'What were the ancient Egyptian rulers called?',
        options: ['Kings', 'Pharaohs', 'Emperors', 'Sultans'],
        correct: 1,
        fact: 'Pharaohs were the rulers of ancient Egypt!'
      },
      {
        question: 'What famous structures did the ancient Egyptians build?',
        options: ['Towers', 'Pyramids', 'Bridges', 'Castles'],
        correct: 1,
        fact: 'The Great Pyramid of Giza is one of the Seven Wonders!'
      },
      {
        question: 'What river was important to ancient Egypt?',
        options: ['Nile', 'Amazon', 'Mississippi', 'Thames'],
        correct: 0,
        fact: 'The Nile River was the lifeblood of ancient Egypt!'
      },
      {
        question: 'What did ancient Egyptians write on?',
        options: ['Paper', 'Papyrus', 'Stone', 'Wood'],
        correct: 1,
        fact: 'Papyrus was made from a plant and used for writing!'
      },
      {
        question: 'What animal was sacred in ancient Egypt?',
        options: ['Lion', 'Cat', 'Eagle', 'Snake'],
        correct: 1,
        fact: 'Cats were considered sacred and were often mummified!'
      }
    ];

    // Start first question
    this.showQuestion();
  }

  showQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      // Game complete
      this.questionText.setText('🎉 Great job! You completed the quest! 🎉');
      this.factText.setVisible(false);
      this.optionButtons.forEach(btn => btn.setVisible(false));
      this.optionLabels.forEach(lbl => lbl.setVisible(false));
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    
    this.questionText.setText(question.question);
    this.factText.setVisible(false);
    this.feedbackText.setVisible(false);

    // Update option buttons
    question.options.forEach((option, index) => {
      this.optionLabels[index].setText(option);
      this.optionButtons[index].off('pointerdown');
      this.optionButtons[index].on('pointerdown', () => this.selectAnswer(index));
      this.optionButtons[index].setVisible(true);
      this.optionLabels[index].setVisible(true);
    });
  }

  selectAnswer(selectedIndex: number) {
    const question = this.questions[this.currentQuestionIndex];

    if (selectedIndex === question.correct) {
      // Correct!
      this.correctCount++;
      this.score += 20;
      this.updateScore();

      this.feedbackText.setText('🎉 Correct! 🎉');
      this.feedbackText.setStyle({ color: '#06D6A0' });
      this.feedbackText.setVisible(true);

      // Show fact
      this.factText.setText(`💡 ${question.fact}`);
      this.factText.setVisible(true);

      // Wait and show next question
      this.time.delayedCall(2500, () => {
        this.currentQuestionIndex++;
        this.showQuestion();
      });
    } else {
      // Wrong answer
      this.feedbackText.setText('Try again! 😊');
      this.feedbackText.setStyle({ color: '#FF6B6B' });
      this.feedbackText.setVisible(true);

      // Shake animation
      this.tweens.add({
        targets: this.questionText,
        x: this.questionText.x - 10,
        duration: 100,
        yoyo: true,
        repeat: 2,
      });

      this.time.delayedCall(1500, () => {
        this.feedbackText.setVisible(false);
      });
    }
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }
}

