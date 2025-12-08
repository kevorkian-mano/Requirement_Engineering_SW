import * as Phaser from 'phaser';

export class AlphabetJourneyGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private currentLetter: string = '';
  private letterText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private letterButtons: Phaser.GameObjects.Rectangle[] = [];
  private letterLabels: Phaser.GameObjects.Text[] = [];
  private correctCount: number = 0;
  private onScoreUpdate?: (score: number) => void;
  private feedbackText!: Phaser.GameObjects.Text;
  private alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  private currentOptions: string[] = [];
  private letterImage!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: 'AlphabetJourneyGame' });
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
    this.add.rectangle(400, 300, 800, 600, 0xE8F5E9);
    
    // Title
    this.add.text(400, 40, 'Alphabet Journey', {
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
    this.instructionText = this.add.text(400, 120, 'Find the letter!', {
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

    // Create letter display area
    const letterArea = this.add.rectangle(400, 280, 200, 200, 0xFFFFFF, 0.3);
    letterArea.setStrokeStyle(4, 0x4ECDC4);

    // Create letter buttons (4 options)
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D];
    const startX = 200;
    const startY = 450;
    const spacing = 200;
    const buttonSize = 120;

    for (let i = 0; i < 4; i++) {
      const x = startX + i * spacing;

      const button = this.add.rectangle(x, startY, buttonSize, buttonSize, buttonColors[i], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(4, 0xFFFFFF);

      const label = this.add.text(x, startY, '', {
        fontSize: '48px',
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

      this.letterButtons.push(button);
      this.letterLabels.push(label);
    }

    // Start first question
    this.generateNewQuestion();
  }

  generateNewQuestion() {
    // Select random letter
    this.currentLetter = Phaser.Math.RND.pick(this.alphabet);
    
    // Generate 3 wrong options + correct answer
    const wrongOptions = this.alphabet
      .filter(letter => letter !== this.currentLetter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    this.currentOptions = [...wrongOptions, this.currentLetter].sort(() => Math.random() - 0.5);

    // Clear previous letter
    if (this.letterText) {
      this.letterText.destroy();
    }

    // Create large letter display
    this.letterText = this.add.text(400, 280, this.currentLetter, {
      fontSize: '120px',
      color: Phaser.Math.RND.pick([0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0xAA96DA]),
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Animate letter appearance
    this.letterText.setScale(0);
    this.tweens.add({
      targets: this.letterText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Update button labels
    this.currentOptions.forEach((letter, index) => {
      this.letterLabels[index].setText(letter);
      this.letterButtons[index].off('pointerdown');
      this.letterButtons[index].on('pointerdown', () => this.selectLetter(letter));
    });

    // Update instruction
    this.instructionText.setText(`Find the letter "${this.currentLetter}"!`);
    this.feedbackText.setVisible(false);
  }

  selectLetter(selectedLetter: string) {
    if (selectedLetter === this.currentLetter) {
      // Correct!
      this.correctCount++;
      this.score += 10;
      this.updateScore();

      this.feedbackText.setText('🎉 Wonderful! 🎉');
      this.feedbackText.setStyle({ color: '#06D6A0' });
      this.feedbackText.setVisible(true);

      // Animate letter
      this.tweens.add({
        targets: this.letterText,
        scale: 1.3,
        y: this.letterText.y - 20,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut',
      });

      // Add sparkle effect
      for (let i = 0; i < 5; i++) {
        const sparkle = this.add.star(
          Phaser.Math.Between(300, 500),
          Phaser.Math.Between(200, 360),
          5,
          5,
          10,
          0xFFD700
        );
        this.tweens.add({
          targets: sparkle,
          scale: 0,
          alpha: 0,
          duration: 500,
          onComplete: () => sparkle.destroy(),
        });
      }

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
        targets: this.letterText,
        x: this.letterText.x - 10,
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

