import * as Phaser from 'phaser';

export class MultiplicationMasterGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private currentQuestion: { num1: number; num2: number; answer: number } | null = null;
  private questionText!: Phaser.GameObjects.Text;
  private answerButtons: Phaser.GameObjects.Rectangle[] = [];
  private answerLabels: Phaser.GameObjects.Text[] = [];
  private correctCount: number = 0;
  private onScoreUpdate?: (score: number) => void;
  private feedbackText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private level: number = 1;

  constructor() {
    super({ key: 'MultiplicationMasterGame' });
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

    // Background
    this.add.rectangle(400, 300, 800, 600, 0xE3F2FD);
    
    // Title
    this.add.text(400, 40, 'Multiplication Master', {
      fontSize: '42px',
      color: '#1976D2',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 40, 'Score: 0', {
      fontSize: '24px',
      color: '#FF6B6B',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    // Level display
    this.levelText = this.add.text(650, 40, 'Level: 1', {
      fontSize: '24px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    // Question text
    this.questionText = this.add.text(400, 180, '', {
      fontSize: '48px',
      color: '#333333',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Feedback text
    this.feedbackText = this.add.text(400, 250, '', {
      fontSize: '36px',
      color: '#06D6A0',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5).setVisible(false);

    // Create answer buttons (4 options)
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D];
    const startX = 200;
    const startY = 400;
    const spacing = 200;
    const buttonWidth = 150;
    const buttonHeight = 80;

    for (let i = 0; i < 4; i++) {
      const x = startX + i * spacing;

      const button = this.add.rectangle(x, startY, buttonWidth, buttonHeight, buttonColors[i], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(3, 0xFFFFFF);

      const label = this.add.text(x, startY, '', {
        fontSize: '32px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      }).setOrigin(0.5);

      button.on('pointerover', () => {
        button.setScale(1.1);
        button.setFillStyle(buttonColors[i], 0.8);
      });
      button.on('pointerout', () => {
        button.setScale(1);
        button.setFillStyle(buttonColors[i], 1);
      });

      this.answerButtons.push(button);
      this.answerLabels.push(label);
    }

    // Start first question
    this.generateNewQuestion();
  }

  generateNewQuestion() {
    // Generate multiplication based on level
    let maxNum = 5 + this.level; // Start with 1-5, increase with level
    if (maxNum > 10) maxNum = 10;

    const num1 = Phaser.Math.Between(1, maxNum);
    const num2 = Phaser.Math.Between(1, maxNum);
    const answer = num1 * num2;

    this.currentQuestion = { num1, num2, answer };

    // Display question
    this.questionText.setText(`${num1} × ${num2} = ?`);

    // Generate wrong answers
    const wrongAnswers: number[] = [];
    while (wrongAnswers.length < 3) {
      const wrong = answer + Phaser.Math.Between(-10, 10);
      if (wrong !== answer && wrong > 0 && !wrongAnswers.includes(wrong)) {
        wrongAnswers.push(wrong);
      }
    }

    // Mix correct and wrong answers
    const allAnswers = [...wrongAnswers, answer].sort(() => Math.random() - 0.5);

    // Update button labels
    allAnswers.forEach((ans, index) => {
      this.answerLabels[index].setText(ans.toString());
      this.answerButtons[index].off('pointerdown');
      this.answerButtons[index].on('pointerdown', () => this.selectAnswer(ans));
    });

    this.feedbackText.setVisible(false);
  }

  selectAnswer(selectedAnswer: number) {
    if (!this.currentQuestion) return;

    if (selectedAnswer === this.currentQuestion.answer) {
      // Correct!
      this.correctCount++;
      this.score += 15;
      this.updateScore();

      // Level up every 5 correct answers
      if (this.correctCount % 5 === 0) {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
      }

      this.feedbackText.setText('🎉 Correct! 🎉');
      this.feedbackText.setStyle({ color: '#06D6A0' });
      this.feedbackText.setVisible(true);

      // Animate question
      this.tweens.add({
        targets: this.questionText,
        scale: 1.2,
        duration: 200,
        yoyo: true,
      });

      // Wait and show next question
      this.time.delayedCall(1500, () => {
        this.generateNewQuestion();
      });
    } else {
      // Wrong answer
      this.feedbackText.setText('Try again! 💪');
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

      this.time.delayedCall(1000, () => {
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

