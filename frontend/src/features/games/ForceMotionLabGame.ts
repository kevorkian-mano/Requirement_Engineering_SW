import * as Phaser from 'phaser';

export class ForceMotionLabGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private ball!: Phaser.Physics.Arcade.Sprite;
  private target!: Phaser.GameObjects.Rectangle;
  private forceSlider!: Phaser.GameObjects.Rectangle;
  private forceValue: number = 50;
  private forceText!: Phaser.GameObjects.Text;
  private angleSlider!: Phaser.GameObjects.Rectangle;
  private angleValue: number = 45;
  private angleText!: Phaser.GameObjects.Text;
  private launchButton!: Phaser.GameObjects.Rectangle;
  private resetButton!: Phaser.GameObjects.Rectangle;
  private onScoreUpdate?: (score: number) => void;
  private instructionText!: Phaser.GameObjects.Text;
  private attempts: number = 0;
  private hits: number = 0;

  constructor() {
    super({ key: 'ForceMotionLabGame' });
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
    this.add.rectangle(400, 300, 800, 600, 0xF5F5F5);
    
    // Title
    this.add.text(400, 30, 'Force & Motion Lab', {
      fontSize: '40px',
      color: '#1976D2',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 30, 'Score: 0', {
      fontSize: '22px',
      color: '#FF6B6B',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    // Instruction
    this.instructionText = this.add.text(400, 80, 'Adjust force and angle to hit the target!', {
      fontSize: '24px',
      color: '#333333',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Create ground
    const ground = this.add.rectangle(400, 550, 800, 100, 0x8B4513);
    this.physics.add.existing(ground, true);
    (ground.body as Phaser.Physics.Arcade.Body).setImmovable(true);

    // Create target
    this.target = this.add.rectangle(650, 450, 80, 80, 0xFF0000);
    this.target.setStrokeStyle(3, 0xFFFFFF);
    this.physics.add.existing(this.target, true);
    (this.target.body as Phaser.Physics.Arcade.Body).setImmovable(true);

    // Create ball using graphics
    const ballGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    ballGraphics.fillStyle(0x0000FF);
    ballGraphics.fillCircle(15, 15, 15);
    ballGraphics.generateTexture('ball', 30, 30);
    ballGraphics.destroy();

    this.ball = this.physics.add.sprite(100, 500, 'ball');
    this.ball.setCollideWorldBounds(true);
    (this.ball.body as Phaser.Physics.Arcade.Body).setBounce(0.3);

    // Force slider
    this.add.text(150, 200, 'Force:', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    const forceTrack = this.add.rectangle(250, 200, 200, 10, 0xCCCCCC);
    this.forceSlider = this.add.rectangle(250 + this.forceValue, 200, 20, 30, 0x4ECDC4);
    this.forceSlider.setInteractive({ useHandCursor: true, draggable: true });

    this.forceText = this.add.text(470, 200, '50', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    this.input.setDraggable(this.forceSlider);
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === this.forceSlider) {
        const newX = Phaser.Math.Clamp(dragX, 150, 350);
        this.forceSlider.x = newX;
        this.forceValue = Math.round((newX - 150) / 2);
        this.forceText.setText(this.forceValue.toString());
      }
    });

    // Angle slider
    this.add.text(150, 250, 'Angle:', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    const angleTrack = this.add.rectangle(250, 250, 200, 10, 0xCCCCCC);
    this.angleSlider = this.add.rectangle(250 + this.angleValue, 250, 20, 30, 0x06D6A0);
    this.angleSlider.setInteractive({ useHandCursor: true, draggable: true });

    this.angleText = this.add.text(470, 250, '45°', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    this.input.setDraggable(this.angleSlider);
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === this.angleSlider) {
        const newX = Phaser.Math.Clamp(dragX, 150, 350);
        this.angleSlider.x = newX;
        this.angleValue = Math.round((newX - 150) / 2);
        this.angleText.setText(this.angleValue + '°');
      }
    });

    // Launch button
    this.launchButton = this.add.rectangle(200, 320, 150, 50, 0x4ECDC4);
    this.launchButton.setStrokeStyle(3, 0xFFFFFF);
    this.launchButton.setInteractive({ useHandCursor: true });

    this.add.text(200, 320, 'Launch!', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.launchButton.on('pointerdown', () => this.launchBall());

    // Reset button
    this.resetButton = this.add.rectangle(400, 320, 150, 50, 0xFF6B6B);
    this.resetButton.setStrokeStyle(3, 0xFFFFFF);
    this.resetButton.setInteractive({ useHandCursor: true });

    this.add.text(400, 320, 'Reset', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.resetButton.on('pointerdown', () => this.resetBall());

    // Collision detection
    this.physics.add.overlap(this.ball, this.target, () => this.hitTarget(), undefined, this);
  }

  launchBall() {
    if (this.ball.body!.velocity.x !== 0 || this.ball.body!.velocity.y !== 0) {
      return; // Ball already moving
    }

    this.attempts++;
    const angleRad = Phaser.Math.DegToRad(this.angleValue);
    const velocityX = this.forceValue * Math.cos(angleRad);
    const velocityY = -this.forceValue * Math.sin(angleRad);

    this.ball.setVelocity(velocityX, velocityY);
  }

  hitTarget() {
    this.hits++;
    this.score += 50;
    this.updateScore();

    // Show success message
    const successText = this.add.text(400, 150, '🎉 Target Hit! 🎉', {
      fontSize: '32px',
      color: '#06D6A0',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      successText.destroy();
      this.resetBall();
    });
  }

  resetBall() {
    this.ball.setPosition(100, 500);
    this.ball.setVelocity(0, 0);
  }

  update() {
    // Check if ball stopped moving
    if (this.ball.body!.velocity.x === 0 && this.ball.body!.velocity.y === 0 && this.ball.y > 400) {
      // Ball has stopped, can launch again
    }
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score} (Hits: ${this.hits}/${this.attempts})`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }
}

