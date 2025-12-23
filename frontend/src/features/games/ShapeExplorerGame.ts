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
  private shapeDisplayArea!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'ShapeExplorerGame' });
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

    // Create beautiful gradient background
    this.createGradientBackground();

    // Title with shadow effect - properly centered at top
    const titleShadow = this.add.text(401, 41, 'Shape Explorer', {
      fontSize: '40px', // Reduced for better fit
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      alpha: 0.3
    }).setOrigin(0.5);

    const title = this.add.text(400, 40, 'Shape Explorer', {
      fontSize: '40px',
      color: '#FF6B6B',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Score display - moved to top left
    this.scoreText = this.add.text(20, 20, '⭐ Score: 0', {
      fontSize: '22px',
      color: '#FF6B6B',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      backgroundColor: '#FFFFFF',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0, 0);

    // Instruction text - moved up
    this.instructionText = this.add.text(400, 100, 'Find the matching shape!', {
      fontSize: '26px', // Slightly smaller
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#4ECDC4',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Create shape display area - centered with proper margins
    this.shapeDisplayArea = this.add.rectangle(400, 250, 200, 200, 0xFFFFFF, 0.2);
    this.shapeDisplayArea.setStrokeStyle(3, 0xFFFFFF);
    
    // Add inner decoration
    const innerRing = this.add.graphics();
    innerRing.lineStyle(2, 0x4ECDC4, 0.5);
    innerRing.strokeCircle(400, 250, 85);
    
    // Add outer decoration
    const outerRing = this.add.graphics();
    outerRing.lineStyle(2, 0xFFD93D, 0.3);
    outerRing.strokeCircle(400, 250, 95);

    // Feedback text - positioned below shape
    this.feedbackText = this.add.text(400, 340, '', {
      fontSize: '30px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);

    // Create decorative floating shapes - reduced count for performance
    this.createFloatingShapes();

    // Create shape buttons with better layout - properly spaced grid
    const buttonColors = [
      0xFF6B6B,  // Red
      0x4ECDC4,  // Teal
      0x06D6A0,  // Green
      0xFFD93D,  // Yellow
      0xAA96DA,  // Purple
      0xFCBAD3   // Pink
    ];
    
    const buttonHoverColors = [
      0xFF8B8B,  // Light Red
      0x6EEDD4,  // Light Teal
      0x38E6B9,  // Light Green
      0xFFE566,  // Light Yellow
      0xC5B4E3,  // Light Purple
      0xFFD1DC   // Light Pink
    ];

    // Grid layout: 2 rows × 3 columns - properly spaced
    const buttonSize = 100; // Slightly smaller buttons
    const buttonSpacingX = 140; // More space between columns
    const buttonSpacingY = 120; // More space between rows
    
    // Calculate starting positions to center the grid
    const totalGridWidth = (3 * buttonSize) + (2 * (buttonSpacingX - buttonSize));
    const startX = (800 - totalGridWidth) / 2 + buttonSize/2;
    const startY = 420; // Moved up to fit better

    this.shapes.forEach((shape, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      const x = startX + col * buttonSpacingX;
      const y = startY + row * buttonSpacingY;

      // Button shadow
      const buttonShadow = this.add.rectangle(x + 3, y + 3, buttonSize, buttonSize, 0x000000, 0.3);
      
      // Button
      const button = this.add.rectangle(x, y, buttonSize, buttonSize, buttonColors[index], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(3, 0xFFFFFF);
      
      // Create shape icon on button
      const iconColor = 0xFFFFFF;
      const iconSize = 30; // Slightly smaller icons
      
      let shapeIcon: Phaser.GameObjects.Shape;
      switch (shape) {
        case 'circle':
          shapeIcon = this.add.circle(x, y, iconSize, iconColor);
          break;
        case 'square':
          shapeIcon = this.add.rectangle(x, y, iconSize * 1.8, iconSize * 1.8, iconColor);
          shapeIcon.setOrigin(0.5);
          break;
        case 'triangle':
          shapeIcon = this.add.triangle(x, y, 0, -iconSize, -iconSize, iconSize, iconSize, iconSize, iconColor);
          break;
        case 'rectangle':
          shapeIcon = this.add.rectangle(x, y, iconSize * 2.2, iconSize * 1.4, iconColor);
          shapeIcon.setOrigin(0.5);
          break;
        case 'star':
          shapeIcon = this.add.star(x, y, 5, iconSize * 0.7, iconSize * 0.9, iconColor);
          break;
        case 'diamond':
          shapeIcon = this.createDiamond(x, y, iconSize * 1.1, iconSize * 1.8, iconColor);
          break;
      }

      // Shape label
      const label = this.add.text(x, y + buttonSize/2 + 12, shape, {
        fontSize: '18px', // Smaller font
        color: '#333333',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        backgroundColor: '#FFFFFF',
        padding: { left: 8, right: 8, top: 3, bottom: 3 }
      }).setOrigin(0.5);

      // Hover effects
      button.on('pointerover', () => {
        button.setScale(1.08);
        if (shapeIcon) shapeIcon.setScale(1.08);
        button.setFillStyle(buttonHoverColors[index], 1);
        label.setStyle({ color: buttonColors[index] });
      });
      
      button.on('pointerout', () => {
        button.setScale(1);
        if (shapeIcon) shapeIcon.setScale(1);
        button.setFillStyle(buttonColors[index], 1);
        label.setStyle({ color: '#333333' });
      });

      // Click handler
      button.on('pointerdown', () => this.selectShape(shape));

      this.shapeButtons.push(button);
      this.shapeLabels.push(label);
    });

    // Progress indicator - top right
    const progressText = this.add.text(780, 20, `Correct: ${this.correctCount}`, {
      fontSize: '18px',
      color: '#4ECDC4',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      backgroundColor: '#FFFFFF',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(1, 0);

    // Start first question
    this.generateNewQuestion();
  }

  createGradientBackground() {
    // Simple solid background with soft color
    this.add.rectangle(400, 300, 800, 600, 0xFFF5E1);
    
    // Add subtle gradient effect with overlays
    const topOverlay = this.add.rectangle(400, 150, 800, 300, 0xFFE8D6);
    topOverlay.setAlpha(0.5);
    
    const bottomOverlay = this.add.rectangle(400, 450, 800, 300, 0xFFCEC2);
    bottomOverlay.setAlpha(0.3);
  }

  createFloatingShapes() {
    // Create fewer decorative floating shapes
    const shapeTypes = ['circle', 'triangle', 'square'];
    const colors = [0xFF6B6B, 0x4ECDC4, 0xFFD93D];
    
    for (let i = 0; i < 6; i++) {
      const shapeType = Phaser.Math.RND.pick(shapeTypes);
      const color = Phaser.Math.RND.pick(colors);
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(100, 500);
      const size = Phaser.Math.Between(15, 30);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.25);
      
      let shape: Phaser.GameObjects.Shape;
      
      switch (shapeType) {
        case 'circle':
          shape = this.add.circle(x, y, size, color, alpha);
          break;
        case 'triangle':
          shape = this.add.triangle(x, y, 0, -size, -size, size, size, size, color, alpha);
          break;
        case 'square':
          shape = this.add.rectangle(x, y, size * 1.8, size * 1.8, color, alpha);
          shape.setOrigin(0.5);
          break;
      }
      
      if (shape) {
        // Float animation
        this.tweens.add({
          targets: shape,
          y: y + Phaser.Math.Between(-20, 20),
          rotation: Phaser.Math.Between(-0.5, 0.5),
          duration: Phaser.Math.Between(3000, 5000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  createDiamond(x: number, y: number, width: number, height: number, color: number, alpha?: number): Phaser.GameObjects.Shape {
    // Create diamond using two triangles
    const diamond = this.add.triangle(x, y, 0, -height/2, -width/2, 0, 0, height/2, color, alpha);
    this.add.triangle(x, y, 0, height/2, width/2, 0, 0, -height/2, color, alpha);
    return diamond;
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
    const shapeY = 250;
    const shapeColor = Phaser.Math.RND.pick([0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0xAA96DA, 0xFCBAD3]);

    switch (this.currentShape) {
      case 'circle':
        this.shapeObject = this.add.circle(shapeX, shapeY, 60, shapeColor);
        break;
      case 'square':
        this.shapeObject = this.add.rectangle(shapeX, shapeY, 100, 100, shapeColor);
        this.shapeObject.setOrigin(0.5);
        break;
      case 'triangle':
        this.shapeObject = this.add.triangle(shapeX, shapeY, 0, -50, -40, 40, 40, 40, shapeColor);
        break;
      case 'rectangle':
        this.shapeObject = this.add.rectangle(shapeX, shapeY, 120, 80, shapeColor);
        this.shapeObject.setOrigin(0.5);
        break;
      case 'star':
        this.shapeObject = this.add.star(shapeX, shapeY, 5, 20, 40, shapeColor);
        break;
      case 'diamond':
        this.shapeObject = this.createDiamond(shapeX, shapeY, 50, 100, shapeColor);
        break;
    }

    // Animate shape appearance
    this.shapeObject.setScale(0);
    this.shapeObject.setAlpha(0);
    
    this.tweens.add({
      targets: this.shapeObject,
      scale: 1,
      alpha: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Start subtle pulsing animation
        this.tweens.add({
          targets: this.shapeObject,
          scale: 1.03,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Update instruction with animation
    this.instructionText.setText(`Find the ${this.currentShape}!`);
    
    this.tweens.add({
      targets: this.instructionText,
      scale: 1.05,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    this.feedbackText.setVisible(false);
  }

  selectShape(selectedShape: string) {
    if (selectedShape === this.currentShape) {
      // Correct!
      this.correctCount++;
      this.score += 10;
      this.updateScore();

      // Celebration feedback
      this.feedbackText.setText('🎉 Excellent! 🎉');
      this.feedbackText.setStyle({ color: '#06D6A0' });
      this.feedbackText.setVisible(true);

      // Enhanced shape animation
      this.tweens.add({
        targets: this.shapeObject,
        scale: 1.4,
        rotation: Math.PI * 2,
        duration: 700,
        ease: 'Back.easeOut',
      });

      // Add celebration sparkles
      this.createCelebrationSparkles();

      // Wait and show next question
      this.time.delayedCall(1800, () => {
        this.generateNewQuestion();
      });
    } else {
      // Wrong answer feedback
      this.feedbackText.setText('Try again! 💫');
      this.feedbackText.setStyle({ color: '#FF6B6B' });
      this.feedbackText.setVisible(true);

      // Shake animation for shape
      this.tweens.add({
        targets: this.shapeObject,
        x: this.shapeObject.x - 10,
        duration: 60,
        yoyo: true,
        repeat: 2,
      });

      // Find and highlight the wrong button
      const buttonIndex = this.shapes.indexOf(selectedShape);
      if (buttonIndex !== -1) {
        this.tweens.add({
          targets: this.shapeButtons[buttonIndex],
          scale: 0.95,
          duration: 80,
          yoyo: true,
          repeat: 1,
        });
      }

      // Hide feedback after delay
      this.time.delayedCall(1000, () => {
        this.feedbackText.setVisible(false);
      });
    }
  }

  createCelebrationSparkles() {
    // Create simple sparkle effects
    for (let i = 0; i < 8; i++) {
      const sparkle = this.add.star(
        Phaser.Math.Between(370, 430),
        Phaser.Math.Between(230, 270),
        5,
        4,
        8,
        Phaser.Math.RND.pick([0xFFD700, 0xFFFFFF, 0xFF6B6B, 0x4ECDC4])
      );
      
      this.tweens.add({
        targets: sparkle,
        scale: 0,
        alpha: 0,
        x: sparkle.x + Phaser.Math.Between(-80, 80),
        y: sparkle.y + Phaser.Math.Between(-40, 40),
        rotation: Phaser.Math.Between(-2, 2),
        duration: 800,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
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