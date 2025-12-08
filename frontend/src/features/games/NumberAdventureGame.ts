import * as Phaser from 'phaser';

export class NumberAdventureGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private currentNumber: number = 0;
  private targetNumber: number = 0;
  private numberText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private numberButtons: Phaser.GameObjects.Rectangle[] = [];
  private numberLabels: Phaser.GameObjects.Text[] = [];
  private correctCount: number = 0;
  private onScoreUpdate?: (score: number) => void;
  private stars: Phaser.GameObjects.Star[] = [];
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'NumberAdventureGame' });
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

    // Colorful background
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB);
    
    // Title
    this.add.text(400, 40, 'Number Adventure', {
      fontSize: '48px',
      color: '#FF6B6B',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 40, '⭐ Score: 0', {
      fontSize: '28px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    // Instruction text
    this.instructionText = this.add.text(400, 120, 'Count the stars!', {
      fontSize: '32px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Feedback text
    this.feedbackText = this.add.text(400, 200, '', {
      fontSize: '36px',
      color: '#06D6A0',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5).setVisible(false);

    // Create number buttons (1-10)
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0x95E1D3, 0xF38181, 0xAA96DA, 0xFCBAD3, 0xFFFFD2, 0xFFB6C1];
    const startX = 150;
    const startY = 350;
    const spacing = 120;
    const buttonSize = 80;

    for (let i = 0; i < 10; i++) {
      const x = startX + (i % 5) * spacing;
      const y = startY + Math.floor(i / 5) * spacing;

      const button = this.add.rectangle(x, y, buttonSize, buttonSize, buttonColors[i], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(4, 0xFFFFFF);

      const label = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '36px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      }).setOrigin(0.5);

      button.on('pointerdown', () => this.selectNumber(i + 1));
      button.on('pointerover', () => {
        button.setScale(1.1);
        button.setFillStyle(buttonColors[i], 0.8);
      });
      button.on('pointerout', () => {
        button.setScale(1);
        button.setFillStyle(buttonColors[i], 1);
      });

      this.numberButtons.push(button);
      this.numberLabels.push(label);
    }

    // Start first question
    this.generateNewQuestion();
  }

  generateNewQuestion() {
    // Generate random number of stars (1-10)
    this.targetNumber = Phaser.Math.Between(1, 10);
    
    // Clear previous stars
    this.stars.forEach(star => star.destroy());
    this.stars = [];

    // Create stars
    const starAreaX = 400;
    const starAreaY = 250;
    const starSpacing = 60;
    const starsPerRow = 5;

    for (let i = 0; i < this.targetNumber; i++) {
      const x = starAreaX - (Math.min(this.targetNumber, starsPerRow) - 1) * starSpacing / 2 + (i % starsPerRow) * starSpacing;
      const y = starAreaY + Math.floor(i / starsPerRow) * starSpacing;
      
      const star = this.add.star(x, y, 5, 10, 20, 0xFFD700);
      star.setScale(0.8);
      this.stars.push(star);
    }

    // Update instruction
    this.instructionText.setText(`Count the stars!`);
    this.feedbackText.setVisible(false);
  }

  selectNumber(selectedNumber: number) {
    if (selectedNumber === this.targetNumber) {
      // Correct!
      this.correctCount++;
      this.score += 10;
      this.updateScore();

      this.feedbackText.setText('🎉 Great Job! 🎉');
      this.feedbackText.setStyle({ color: '#06D6A0' });
      this.feedbackText.setVisible(true);

      // Animate stars
      this.stars.forEach((star, index) => {
        this.tweens.add({
          targets: star,
          scale: 1.2,
          duration: 200,
          yoyo: true,
          delay: index * 50,
        });
      });

      // Wait and show next question
      this.time.delayedCall(1500, () => {
        this.generateNewQuestion();
      });
    } else {
      // Wrong answer
      this.feedbackText.setText('Try again! 😊');
      this.feedbackText.setStyle({ color: '#FF6B6B' });
      this.feedbackText.setVisible(true);

      // Shake animation
      this.tweens.add({
        targets: this.feedbackText,
        x: this.feedbackText.x - 10,
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
    this.scoreText.setText(`⭐ Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }
}

