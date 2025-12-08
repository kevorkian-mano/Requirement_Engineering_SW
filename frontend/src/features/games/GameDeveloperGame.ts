import * as Phaser from 'phaser';

export class GameDeveloperGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private codeBlocks: Phaser.GameObjects.Rectangle[] = [];
  private targetSequence: string[] = [];
  private playerSequence: string[] = [];
  private currentLevel: number = 1;
  private onScoreUpdate?: (score: number) => void;
  private instructionText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameDeveloperGame' });
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
    this.add.rectangle(400, 300, 800, 600, 0x1e1e2e);
    
    // Title
    this.add.text(400, 40, 'Game Developer', {
      fontSize: '36px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Score and level
    this.scoreText = this.add.text(50, 50, 'Score: 0', {
      fontSize: '20px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    });

    this.levelText = this.add.text(50, 80, 'Level: 1', {
      fontSize: '20px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    });

    // Instruction
    this.instructionText = this.add.text(400, 100, 'Arrange code blocks in the correct order!', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.startLevel();
  }

  startLevel() {
    // Clear previous blocks
    this.codeBlocks.forEach(block => block.destroy());
    this.codeBlocks = [];
    this.playerSequence = [];

    // Generate target sequence based on level
    if (this.currentLevel === 1) {
      this.targetSequence = ['START', 'MOVE', 'JUMP', 'END'];
    } else if (this.currentLevel === 2) {
      this.targetSequence = ['START', 'LOOP', 'MOVE', 'END'];
    } else {
      this.targetSequence = ['START', 'IF', 'MOVE', 'ELSE', 'JUMP', 'END'];
    }

    // Create shuffled blocks
    const shuffled = this.shuffleArray([...this.targetSequence]);
    const blockY = 200;
    const spacing = 120;
    const startX = 400 - (spacing * (shuffled.length - 1)) / 2;

    shuffled.forEach((block, index) => {
      const blockRect = this.add.rectangle(startX + spacing * index, blockY, 100, 80, this.getBlockColor(block));
      blockRect.setStrokeStyle(3, 0xffffff);
      blockRect.setInteractive({ useHandCursor: true });

      const blockText = this.add.text(startX + spacing * index, blockY, block, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      blockRect.on('pointerdown', () => {
        this.selectBlock(block, blockRect, blockText);
      });

      blockRect.on('pointerover', () => {
        blockRect.setFillStyle(this.getBlockColor(block, true));
      });

      blockRect.on('pointerout', () => {
        blockRect.setFillStyle(this.getBlockColor(block));
      });

      this.codeBlocks.push(blockRect);
    });

    // Create sequence area
    this.add.text(400, 350, 'Your Sequence:', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.updateSequenceDisplay();
  }

  getBlockColor(block: string, hover: boolean = false): number {
    const colors: Record<string, number> = {
      'START': hover ? 0x06D6A0 : 0x4ECDC4,
      'END': hover ? 0xFF6B6B : 0xFF8C42,
      'MOVE': hover ? 0xFFE66D : 0xFFD93D,
      'JUMP': hover ? 0xA8DADC : 0x457B9D,
      'LOOP': hover ? 0x9B59B6 : 0x8E44AD,
      'IF': hover ? 0xE74C3C : 0xC0392B,
      'ELSE': hover ? 0xF39C12 : 0xD68910,
    };
    return colors[block] || 0x95A5A6;
  }

  shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  selectBlock(block: string, blockRect: Phaser.GameObjects.Rectangle, blockText: Phaser.GameObjects.Text) {
    if (this.playerSequence.includes(block)) return;

    this.playerSequence.push(block);
    blockRect.disableInteractive();
    blockRect.setAlpha(0.5);

    this.updateSequenceDisplay();
    this.checkSequence();
  }

  updateSequenceDisplay() {
    // Clear previous sequence display
    const existing = this.children.list.filter((child: any) => child.data && child.data.get('isSequence'));
    existing.forEach((child: any) => child.destroy());

    const sequenceY = 420;
    const spacing = 100;
    const startX = 400 - (spacing * (this.targetSequence.length - 1)) / 2;

    this.targetSequence.forEach((expected, index) => {
      const slot = this.add.rectangle(startX + spacing * index, sequenceY, 80, 60, 0x34495e);
      slot.setStrokeStyle(2, 0x7f8c8d);
      slot.setData('isSequence', true);

      if (index < this.playerSequence.length) {
        const playerBlock = this.playerSequence[index];
        const isCorrect = playerBlock === expected;
        
        this.add.rectangle(startX + spacing * index, sequenceY, 70, 50, 
          isCorrect ? 0x06D6A0 : 0xFF6B6B);
        this.add.text(startX + spacing * index, sequenceY, playerBlock, {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'Arial',
        }).setOrigin(0.5);
      }
    });
  }

  checkSequence() {
    if (this.playerSequence.length !== this.targetSequence.length) return;

    const isCorrect = this.playerSequence.every((block, index) => block === this.targetSequence[index]);

    if (isCorrect) {
      this.score += 20 * this.currentLevel;
      this.updateScore();

      const feedback = this.add.text(400, 500, `✓ Level ${this.currentLevel} Complete! +${20 * this.currentLevel} points`, {
        fontSize: '24px',
        color: '#06D6A0',
        fontFamily: 'Arial',
      }).setOrigin(0.5);

      this.time.delayedCall(1500, () => {
        feedback.destroy();
        if (this.currentLevel < 3) {
          this.currentLevel++;
          this.levelText.setText(`Level: ${this.currentLevel}`);
          this.startLevel();
        } else {
          this.endGame();
        }
      });
    } else {
      const feedback = this.add.text(400, 500, '✗ Wrong sequence! Try again', {
        fontSize: '24px',
        color: '#FF6B6B',
        fontFamily: 'Arial',
      }).setOrigin(0.5);

      this.time.delayedCall(1500, () => {
        feedback.destroy();
        this.startLevel();
      });
    }
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  endGame() {
    this.codeBlocks.forEach(block => block.destroy());

    const finalScore = this.score + 100; // Bonus for completing all levels

    this.add.rectangle(400, 300, 600, 400, 0x2a2a4e, 0.95);
    this.add.text(400, 200, 'All Levels Complete!', {
      fontSize: '40px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 280, `Final Score: ${finalScore}`, {
      fontSize: '32px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 340, 'You are a Game Developer! 🎮', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    if (this.onScoreUpdate) {
      this.onScoreUpdate(finalScore);
    }
  }
}

