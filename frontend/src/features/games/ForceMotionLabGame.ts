import * as Phaser from 'phaser';

export class ForceMotionLabGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private ball!: Phaser.GameObjects.Arc;
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
  private isBallMoving: boolean = false;
  private ballVelocityX: number = 0;
  private ballVelocityY: number = 0;
  private gravity: number = 0.5;
  private friction: number = 0.99;

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
    this.add.rectangle(400, 550, 800, 100, 0x8B4513);
    
    // Create target
    this.target = this.add.rectangle(650, 450, 80, 80, 0xFF0000);
    this.target.setStrokeStyle(3, 0xFFFFFF);

    // Create ball (using Arc for easier collision)
    this.ball = this.add.circle(100, 500, 15, 0x0000FF);
    
    // Force slider
    this.add.text(150, 200, 'Force:', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Arial',
    });

    const forceTrack = this.add.rectangle(250, 200, 200, 10, 0xCCCCCC);
    this.forceSlider = this.add.rectangle(250, 200, 20, 30, 0x4ECDC4);
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
        this.forceValue = Math.round(((newX - 150) / 200) * 100);
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
    this.angleSlider = this.add.rectangle(295, 250, 20, 30, 0x06D6A0); // Start at 45°
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
        this.angleValue = Math.round(((newX - 150) / 200) * 90);
        this.angleText.setText(this.angleValue + '°');
      }
    });

    // Launch button
    this.launchButton = this.add.rectangle(200, 320, 150, 50, 0x4ECDC4);
    this.launchButton.setStrokeStyle(3, 0xFFFFFF);
    this.launchButton.setInteractive({ useHandCursor: true });

    const launchText = this.add.text(200, 320, 'Launch!', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.launchButton.on('pointerdown', () => {
      if (!this.isBallMoving) {
        this.launchBall();
      }
    });

    // Reset button
    this.resetButton = this.add.rectangle(400, 320, 150, 50, 0xFF6B6B);
    this.resetButton.setStrokeStyle(3, 0xFFFFFF);
    this.resetButton.setInteractive({ useHandCursor: true });

    const resetText = this.add.text(400, 320, 'Reset', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.resetButton.on('pointerdown', () => {
      this.resetBall();
    });

    // Draw trajectory line (optional)
    this.drawTrajectory();
  }

  launchBall() {
    if (this.isBallMoving) return;
    
    this.isBallMoving = true;
    this.attempts++;
    
    // Convert angle to radians
    const angleRad = Phaser.Math.DegToRad(this.angleValue);
    
    // Calculate initial velocity components
    // Force value is used directly as velocity magnitude
    this.ballVelocityX = this.forceValue * Math.cos(angleRad);
    this.ballVelocityY = -this.forceValue * Math.sin(angleRad); // Negative because y goes down in screen coordinates
    
    console.log(`Launching ball: force=${this.forceValue}, angle=${this.angleValue}°`);
    console.log(`Velocity X=${this.ballVelocityX}, Y=${this.ballVelocityY}`);
  }

  update() {
    if (this.isBallMoving) {
      // Apply gravity
      this.ballVelocityY += this.gravity;
      
      // Apply friction (air resistance)
      this.ballVelocityX *= this.friction;
      this.ballVelocityY *= this.friction;
      
      // Update ball position
      this.ball.x += this.ballVelocityX;
      this.ball.y += this.ballVelocityY;
      
      // Ground collision
      if (this.ball.y >= 535) { // Ground level (550 - ball radius 15)
        this.ball.y = 535;
        this.ballVelocityY = -this.ballVelocityY * 0.7; // Bounce with energy loss
        this.ballVelocityX *= 0.9; // Friction on ground
        
        // Stop if velocity is very small
        if (Math.abs(this.ballVelocityX) < 0.5 && Math.abs(this.ballVelocityY) < 0.5) {
          this.isBallMoving = false;
          this.ballVelocityX = 0;
          this.ballVelocityY = 0;
        }
      }
      
      // Wall collisions (left and right bounds)
      if (this.ball.x <= 15) { // Left wall
        this.ball.x = 15;
        this.ballVelocityX = -this.ballVelocityX * 0.7;
      } else if (this.ball.x >= 785) { // Right wall
        this.ball.x = 785;
        this.ballVelocityX = -this.ballVelocityX * 0.7;
      }
      
      // Target collision detection
      this.checkTargetCollision();
    }
  }

  checkTargetCollision() {
    // Simple circle-rectangle collision detection
    const ballRadius = 15;
    const targetLeft = this.target.x - this.target.width / 2;
    const targetRight = this.target.x + this.target.width / 2;
    const targetTop = this.target.y - this.target.height / 2;
    const targetBottom = this.target.y + this.target.height / 2;
    
    // Find closest point on target to ball
    const closestX = Phaser.Math.Clamp(this.ball.x, targetLeft, targetRight);
    const closestY = Phaser.Math.Clamp(this.ball.y, targetTop, targetBottom);
    
    // Calculate distance between ball and closest point
    const distanceX = this.ball.x - closestX;
    const distanceY = this.ball.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    
    // Check if distance is less than ball radius
    if (distanceSquared < (ballRadius * ballRadius)) {
      this.hitTarget();
    }
  }

  hitTarget() {
    if (!this.isBallMoving) return;
    
    this.isBallMoving = false;
    this.hits++;
    this.score += 50;
    this.updateScore();

    // Visual feedback
    this.target.fillColor = 0x00FF00; // Change to green
    this.ball.fillColor = 0xFFFF00; // Change ball to yellow
    
    // Show success message
    const successText = this.add.text(400, 150, '🎉 Target Hit! 🎉', {
      fontSize: '32px',
      color: '#06D6A0',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      successText.destroy();
      // Reset colors
      this.target.fillColor = 0xFF0000;
      this.ball.fillColor = 0x0000FF;
      this.resetBall();
    });
  }

  resetBall() {
    this.isBallMoving = false;
    this.ballVelocityX = 0;
    this.ballVelocityY = 0;
    this.ball.x = 100;
    this.ball.y = 500;
    this.ball.fillColor = 0x0000FF;
    
    // Reset sliders to default values
    this.forceSlider.x = 250;
    this.forceValue = 50;
    this.forceText.setText('50');
    
    this.angleSlider.x = 295;
    this.angleValue = 45;
    this.angleText.setText('45°');
  }

  drawTrajectory() {
    // This is an optional function to show trajectory prediction
    // You can call this when sliders change
    const graphics = this.add.graphics();
    
    const updateTrajectory = () => {
      graphics.clear();
      graphics.lineStyle(2, 0x888888, 0.5);
      
      const angleRad = Phaser.Math.DegToRad(this.angleValue);
      let velX = this.forceValue * Math.cos(angleRad);
      let velY = -this.forceValue * Math.sin(angleRad);
      
      let x = 100;
      let y = 500;
      
      graphics.beginPath();
      graphics.moveTo(x, y);
      
      // Simulate trajectory for 100 frames
      for (let i = 0; i < 100; i++) {
        velY += this.gravity;
        velX *= this.friction;
        velY *= this.friction;
        
        x += velX;
        y += velY;
        
        graphics.lineTo(x, y);
        
        // Stop if hits ground
        if (y >= 535) break;
      }
      
      graphics.strokePath();
    };
    
    // Update trajectory when sliders change
    this.forceSlider.on('drag', updateTrajectory);
    this.angleSlider.on('drag', updateTrajectory);
    updateTrajectory();
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score} (Hits: ${this.hits}/${this.attempts})`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }
}