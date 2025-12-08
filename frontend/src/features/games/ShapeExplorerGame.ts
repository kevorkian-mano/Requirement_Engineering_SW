import * as Phaser from 'phaser';

export class ShapeExplorerGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private currentShape: string = '';
  private shapeObject!: Phaser.GameObjects.Shape;
  private instructionText!: Phaser.GameObjects.Text;
  private shapeButtons: Phaser.GameObjects.Rectangle[] = [];
  private shapeLabels: Phaser.GameObjects.Text[] = [];
  private correctCount: number = 0;
  private onScoreUpdate?: (score: number) => void;
  private feedbackText!: Phaser.GameObjects.Text;
  private shapes: string[] = ['circle', 'square', 'triangle', 'rectangle', 'star', 'diamond'];

  constructor() {
    super({ key: 'ShapeExplorerGame' });
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
    this.add.rectangle(400, 300, 800, 600, 0xFFF5E1);
    
    // Title
    this.add.text(400, 40, 'Shape Explorer', {
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
    this.instructionText = this.add.text(400, 120, 'Find the shape!', {
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

    // Create shape display area
    const shapeArea = this.add.rectangle(400, 280, 200, 200, 0xFFFFFF, 0.3);
    shapeArea.setStrokeStyle(4, 0x4ECDC4);

    // Create shape buttons
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0xAA96DA, 0xFCBAD3];
    const startX = 200;
    const startY = 450;
    const spacing = 120;
    const buttonSize = 100;

    this.shapes.forEach((shape, index) => {
      const x = startX + (index % 3) * spacing;
      const y = startY + Math.floor(index / 3) * spacing;

      const button = this.add.rectangle(x, y, buttonSize, buttonSize, buttonColors[index], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(4, 0xFFFFFF);

      // Create shape icon on button
      let shapeIcon: Phaser.GameObjects.Shape;
      switch (shape) {
        case 'circle':
          shapeIcon = this.add.circle(x, y, 30, buttonColors[index]);
          break;
        case 'square':
          shapeIcon = this.add.rectangle(x, y, 50, 50, buttonColors[index]);
          break;
        case 'triangle':
          shapeIcon = this.add.triangle(x, y, 0, -30, -25, 25, 25, 25, buttonColors[index]);
          break;
        case 'rectangle':
          shapeIcon = this.add.rectangle(x, y, 60, 40, buttonColors[index]);
          break;
        case 'star':
          shapeIcon = this.add.star(x, y, 5, 15, 25, buttonColors[index]);
          break;
        case 'diamond':
          shapeIcon = this.add.triangle(x, y, 0, -30, -25, 0, 0, 30, buttonColors[index]);
          this.add.triangle(x, y, 0, 30, 25, 0, 0, -30, buttonColors[index]);
          break;
        default:
          shapeIcon = this.add.circle(x, y, 30, buttonColors[index]);
      }

      const label = this.add.text(x, y + 50, shape, {
        fontSize: '20px',
        color: '#333333',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      }).setOrigin(0.5);

      button.on('pointerdown', () => this.selectShape(shape));
      button.on('pointerover', () => {
        button.setScale(1.1);
        shapeIcon.setScale(1.1);
      });
      button.on('pointerout', () => {
        button.setScale(1);
        shapeIcon.setScale(1);
      });

      this.shapeButtons.push(button);
      this.shapeLabels.push(label);
    });

    // Start first question
    this.generateNewQuestion();
  }

  generateNewQuestion() {
    // Select random shape
    this.currentShape = Phaser.Math.RND.pick(this.shapes);
    
    // Clear previous shape
    if (this.shapeObject) {
      this.shapeObject.destroy();
    }

    // Create shape in center
    const shapeX = 400;
    const shapeY = 280;
    const shapeColor = Phaser.Math.RND.pick([0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0xAA96DA, 0xFCBAD3]);

    switch (this.currentShape) {
      case 'circle':
        this.shapeObject = this.add.circle(shapeX, shapeY, 60, shapeColor);
        break;
      case 'square':
        this.shapeObject = this.add.rectangle(shapeX, shapeY, 100, 100, shapeColor);
        break;
      case 'triangle':
        this.shapeObject = this.add.triangle(shapeX, shapeY, 0, -50, -40, 40, 40, 40, shapeColor);
        break;
      case 'rectangle':
        this.shapeObject = this.add.rectangle(shapeX, shapeY, 120, 80, shapeColor);
        break;
      case 'star':
        this.shapeObject = this.add.star(shapeX, shapeY, 5, 20, 40, shapeColor);
        break;
      case 'diamond':
        this.shapeObject = this.add.triangle(shapeX, shapeY, 0, -50, -40, 0, 0, 50, shapeColor);
        this.add.triangle(shapeX, shapeY, 0, 50, 40, 0, 0, -50, shapeColor);
        break;
    }

    // Animate shape appearance
    this.shapeObject.setScale(0);
    this.tweens.add({
      targets: this.shapeObject,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Update instruction
    this.instructionText.setText(`Find the ${this.currentShape}!`);
    this.feedbackText.setVisible(false);
  }

  selectShape(selectedShape: string) {
    if (selectedShape === this.currentShape) {
      // Correct!
      this.correctCount++;
      this.score += 10;
      this.updateScore();

      this.feedbackText.setText('🎉 Excellent! 🎉');
      this.feedbackText.setStyle({ color: '#06D6A0' });
      this.feedbackText.setVisible(true);

      // Animate shape
      this.tweens.add({
        targets: this.shapeObject,
        scale: 1.3,
        rotation: Math.PI * 2,
        duration: 500,
        ease: 'Back.easeOut',
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
        targets: this.shapeObject,
        x: this.shapeObject.x - 10,
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

