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
  private letterArea!: Phaser.GameObjects.Rectangle;
  private gameWidth: number = 800;
  private gameHeight: number = 600;
  private background!: Phaser.GameObjects.Rectangle;

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

    // Create solid background with gradient effect using two rectangles
    this.background = this.add.rectangle(0, 0, this.gameWidth, this.gameHeight, 0xE8F5E9);
    this.background.setOrigin(0, 0);
    
    // Add a second rectangle for gradient effect
    const bottomGradient = this.add.rectangle(0, this.gameHeight/2, this.gameWidth, this.gameHeight/2, 0xBBE9F0);
    bottomGradient.setOrigin(0, 0);
    bottomGradient.setAlpha(0.7);

    // Title with shadow effect
    const title = this.add.text(this.gameWidth / 2, 50, 'Alphabet Journey', {
      fontSize: '48px', // Reduced from 52px
      color: '#FF6B6B',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Add shadow manually for title
    const titleShadow = this.add.text(this.gameWidth / 2 + 3, 53, 'Alphabet Journey', {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      alpha: 0.3
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(30, 30, '⭐ Score: 0', {
      fontSize: '24px', // Reduced from 28px
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      backgroundColor: '#FFFFFF',
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
    }).setOrigin(0, 0);

    // Instruction text
    this.instructionText = this.add.text(this.gameWidth / 2, 120, 'Find the letter!', {
      fontSize: '28px', // Reduced from 32px
      color: '#4ECDC4',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Create letter display area
    this.letterArea = this.add.rectangle(this.gameWidth / 2, 250, 160, 160, 0xFFFFFF, 0.9); // Reduced size
    this.letterArea.setStrokeStyle(4, 0x4ECDC4); // Reduced stroke
    this.letterArea.setDepth(1);

    // Add decorative elements around letter area
    const decorations = this.add.graphics();
    decorations.lineStyle(3, 0xFFD93D, 0.7); // Reduced thickness
    decorations.strokeCircle(this.gameWidth / 2, 250, 100); // Adjusted position
    decorations.strokeCircle(this.gameWidth / 2, 250, 120); // Adjusted position

    // Feedback text
    this.feedbackText = this.add.text(this.gameWidth / 2, 340, '', { // Adjusted position
      fontSize: '32px', // Reduced from 36px
      color: '#06D6A0',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 3
    }).setOrigin(0.5).setVisible(false);

    // Create letter buttons (4 options) with better layout
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D];
    const buttonHoverColors = [0xFF8B8B, 0x6EEDD4, 0x38E6B9, 0xFFE566];
    
    // Calculate button positions
    const buttonSpacing = 150; // Reduced spacing
    const buttonSize = 110; // Reduced size
    const startX = (this.gameWidth - (3 * buttonSpacing)) / 2 + buttonSpacing/2;
    const startY = 470; // Adjusted position

    for (let i = 0; i < 4; i++) {
      const x = startX + i * buttonSpacing;
      const y = startY;

      // Create button with shadow effect using graphics
      const buttonShadow = this.add.rectangle(x + 3, y + 3, buttonSize, buttonSize, 0x000000, 0.2);
      const button = this.add.rectangle(x, y, buttonSize, buttonSize, buttonColors[i], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(4, 0xFFFFFF); // Reduced stroke
      
      // Set depth for proper layering
      buttonShadow.setDepth(0);
      button.setDepth(1);

      const label = this.add.text(x, y, '', {
        fontSize: '48px', // Reduced from 56px
        color: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(2);

      // Hover effects
      button.on('pointerover', () => {
        button.setScale(1.05); // Reduced scale
        button.setFillStyle(buttonHoverColors[i], 1);
      });
      
      button.on('pointerout', () => {
        button.setScale(1);
        button.setFillStyle(buttonColors[i], 1);
      });

      this.letterButtons.push(button);
      this.letterLabels.push(label);
    }

    // Add floating particles for decoration
    this.createFloatingParticles();

    // Progress indicator
    const progressText = this.add.text(this.gameWidth - 30, 30, `Correct: ${this.correctCount}`, {
      fontSize: '18px', // Reduced from 22px
      color: '#4ECDC4',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      backgroundColor: '#FFFFFF',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(1, 0);

    // Hint text
    const hintText = this.add.text(this.gameWidth / 2, 390, 'Click the matching letter below!', { // Adjusted position
      fontSize: '18px', // Reduced from 20px
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Start first question
    this.generateNewQuestion();
  }

  createFloatingParticles() {
    // Create floating alphabet particles in background
    for (let i = 0; i < 15; i++) { // Reduced count
      const letter = Phaser.Math.RND.pick(this.alphabet);
      const x = Phaser.Math.Between(50, this.gameWidth - 50);
      const y = Phaser.Math.Between(100, this.gameHeight - 150);
      const size = Phaser.Math.Between(18, 32); // Reduced size
      
      const particle = this.add.text(x, y, letter, {
        fontSize: `${size}px`,
        color: Phaser.Math.RND.pick(['#FF6B6B', '#4ECDC4', '#06D6A0', '#FFD93D']),
        fontFamily: 'Arial, sans-serif',
        alpha: 0.2 // Reduced alpha
      }).setOrigin(0.5);

      // Animate floating
      this.tweens.add({
        targets: particle,
        y: y + Phaser.Math.Between(-20, 20), // Reduced movement
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
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

    // Create large letter display with animation
    this.letterText = this.add.text(this.gameWidth / 2, 250, this.currentLetter, { // Adjusted position
      fontSize: '120px', // Reduced from 140px
      color: Phaser.Math.RND.pick([0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0xAA96DA]),
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 6 // Reduced thickness
    }).setOrigin(0.5).setDepth(2);

    // Animate letter appearance
    this.letterText.setScale(0);
    this.letterText.setAlpha(0);
    
    this.tweens.add({
      targets: this.letterText,
      scale: 1,
      alpha: 1,
      duration: 500, // Reduced duration
      ease: 'Back.easeOut',
    });

    // Update button labels
    this.currentOptions.forEach((letter, index) => {
      this.letterLabels[index].setText(letter);
      // Remove previous listeners
      this.letterButtons[index].off('pointerdown');
      // Add new listener
      this.letterButtons[index].on('pointerdown', () => this.selectLetter(letter));
    });

    // Update instruction with animation
    this.instructionText.setText(`Find the letter "${this.currentLetter}"!`);
    this.tweens.add({
      targets: this.instructionText,
      scale: 1.05, // Reduced scale
      duration: 200, // Reduced duration
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

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

      // Animate letter with celebration
      this.tweens.add({
        targets: this.letterText,
        scale: 1.3, // Reduced scale
        y: this.letterText.y - 20, // Reduced movement
        duration: 300, // Reduced duration
        yoyo: true,
        ease: 'Back.easeOut',
      });

      // Add sparkle effect
      for (let i = 0; i < 6; i++) { // Reduced count
        const sparkle = this.add.star(
          Phaser.Math.Between(this.gameWidth / 2 - 80, this.gameWidth / 2 + 80), // Reduced range
          Phaser.Math.Between(170, 330), // Adjusted range
          5,
          Phaser.Math.Between(5, 8), // Reduced size
          10,
          Phaser.Math.RND.pick([0xFFD700, 0xFF6B6B, 0x4ECDC4])
        );
        
        this.tweens.add({
          targets: sparkle,
          scale: 0,
          alpha: 0,
          x: sparkle.x + Phaser.Math.Between(-80, 80), // Reduced movement
          y: sparkle.y + Phaser.Math.Between(-40, 40), // Reduced movement
          duration: 600, // Reduced duration
          onComplete: () => sparkle.destroy(),
        });
      }

      // Add simple confetti effect
      this.createConfetti();

      // Wait and show next question
      this.time.delayedCall(1500, () => { // Reduced delay
        this.generateNewQuestion();
      });
    } else {
      // Wrong answer
      this.feedbackText.setText('Try again! 😊');
      this.feedbackText.setStyle({ color: '#FF6B6B' });
      this.feedbackText.setVisible(true);

      // Shake animation for wrong answer
      this.tweens.add({
        targets: this.letterText,
        x: this.letterText.x - 10, // Reduced movement
        duration: 60, // Reduced duration
        yoyo: true,
        repeat: 2,
      });

      // Vibrate the wrong button
      const buttonIndex = this.currentOptions.indexOf(selectedLetter);
      this.tweens.add({
        targets: this.letterButtons[buttonIndex],
        scale: 0.95, // Reduced scale
        duration: 80, // Reduced duration
        yoyo: true,
      });

      this.time.delayedCall(1000, () => { // Reduced delay
        this.feedbackText.setVisible(false);
      });
    }
  }

  createConfetti() {
    const colors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0xAA96DA, 0xFF9A8B];
    for (let i = 0; i < 10; i++) { // Reduced count
      const x = this.gameWidth / 2;
      const y = 250;
      const size = Phaser.Math.Between(8, 15); // Reduced size
      
      const confetti = this.add.rectangle(x, y, size, size, Phaser.Math.RND.pick(colors));
      
      this.tweens.add({
        targets: confetti,
        x: x + Phaser.Math.Between(-150, 150), // Reduced range
        y: y + Phaser.Math.Between(80, 250), // Reduced range
        rotation: Phaser.Math.Between(-2, 2), // Reduced rotation
        scale: 0,
        alpha: 0,
        duration: 1200, // Reduced duration
        ease: 'Power2',
        onComplete: () => confetti.destroy()
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