import * as Phaser from 'phaser';

export class PyramidBuilderGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private blocks: Phaser.GameObjects.Rectangle[] = [];
  private pyramidLayers: number = 0;
  private targetLayers: number = 4;
  private onScoreUpdate?: (score: number) => void;
  private instructionText!: Phaser.GameObjects.Text;
  private layerText!: Phaser.GameObjects.Text;
  private blockCount: number = 0;

  constructor() {
    super({ key: 'PyramidBuilderGame' });
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

    // Background with Egyptian theme
    this.add.rectangle(400, 300, 800, 600, 0xf4a460);
    
    // Title
    this.add.text(400, 40, 'Pyramid Builder', {
      fontSize: '36px',
      color: '#8B4513',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score and layer display
    this.scoreText = this.add.text(50, 50, 'Score: 0', {
      fontSize: '20px',
      color: '#8B4513',
      fontFamily: 'Arial',
    });

    this.layerText = this.add.text(50, 80, 'Layers: 0/4', {
      fontSize: '20px',
      color: '#8B4513',
      fontFamily: 'Arial',
    });

    // Instruction
    this.instructionText = this.add.text(400, 100, 'Click blocks to build your pyramid!', {
      fontSize: '20px',
      color: '#8B4513',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Create falling blocks
    this.createFallingBlocks();
    
    // Ground
    this.add.rectangle(400, 580, 800, 40, 0x8B4513);

    // Physics
    this.physics.world.setBounds(0, 0, 800, 600);
  }

  createFallingBlocks() {
    // Create blocks that fall from top
    const blockTypes = ['stone', 'stone', 'stone', 'gold'];
    const blockColors: Record<string, number> = {
      'stone': 0xCD853F,
      'gold': 0xFFD700,
    };

    this.time.addEvent({
      delay: 1500,
      callback: () => {
        if (this.pyramidLayers < this.targetLayers) {
          const x = Phaser.Math.Between(100, 700);
          const blockType = blockTypes[Phaser.Math.Between(0, blockTypes.length - 1)];
          
          const block = this.add.rectangle(x, 50, 60, 60, blockColors[blockType]);
          block.setStrokeStyle(2, 0x8B4513);
          block.setData('type', blockType);
          block.setData('used', false);

          this.physics.add.existing(block);
          (block.body as Phaser.Physics.Arcade.Body).setGravityY(200);
          (block.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
          (block.body as Phaser.Physics.Arcade.Body).setBounce(0.3);

          block.setInteractive({ useHandCursor: true });
          block.on('pointerdown', () => {
            this.placeBlock(block);
          });

          this.blocks.push(block);

          // Remove block if it falls too low
          this.time.delayedCall(10000, () => {
            if (block.active && !block.getData('used')) {
              block.destroy();
            }
          });
        }
      },
      loop: true,
    });
  }

  placeBlock(block: Phaser.GameObjects.Rectangle) {
    if (block.getData('used')) return;

    const blockType = block.getData('type');
    const layer = this.pyramidLayers;
    const blocksPerLayer = this.targetLayers - layer;
    const blockWidth = 60;
    const spacing = 10;
    const layerWidth = (blocksPerLayer * blockWidth) + ((blocksPerLayer - 1) * spacing);
    const startX = 400 - layerWidth / 2;
    const baseY = 550 - (layer * 70);

    // Calculate position in layer
    const blockIndex = this.blockCount % blocksPerLayer;
    const x = startX + (blockIndex * (blockWidth + spacing)) + blockWidth / 2;
    const y = baseY;

    // Place block
    block.setData('used', true);
    this.physics.world.disable(block);
    block.setPosition(x, y);
    block.setAlpha(1);

    // Add to score
    this.score += blockType === 'gold' ? 15 : 10;
    this.updateScore();
    this.blockCount++;

    // Check if layer is complete
    if (this.blockCount % blocksPerLayer === 0) {
      this.pyramidLayers++;
      this.layerText.setText(`Layers: ${this.pyramidLayers}/${this.targetLayers}`);
      this.blockCount = 0;

      if (this.pyramidLayers >= this.targetLayers) {
        this.endGame();
      } else {
        // Show next layer indicator
        const nextLayerBlocks = this.targetLayers - this.pyramidLayers;
        const nextLayerWidth = (nextLayerBlocks * 60) + ((nextLayerBlocks - 1) * 10);
        const nextStartX = 400 - nextLayerWidth / 2;
        const nextY = 550 - (this.pyramidLayers * 70);

        for (let i = 0; i < nextLayerBlocks; i++) {
          const indicator = this.add.rectangle(
            nextStartX + (i * 70) + 30,
            nextY,
            60,
            60,
            0x8B4513,
            0.3
          );
          indicator.setStrokeStyle(2, 0x654321, 0.5);
        }
      }
    }
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  endGame() {
    // Stop creating blocks
    this.time.removeAllEvents();
    
    // Clear instruction
    if (this.instructionText) {
      this.instructionText.destroy();
    }

    const finalScore = this.score + 100; // Bonus for completing pyramid

    this.add.rectangle(400, 300, 600, 400, 0x2a2a4e, 0.95);
    this.add.text(400, 200, 'Pyramid Complete!', {
      fontSize: '40px',
      color: '#FFD700',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 280, `Final Score: ${finalScore}`, {
      fontSize: '32px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 340, '🏛️ Great Pyramid Builder! 🏛️', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    if (this.onScoreUpdate) {
      this.onScoreUpdate(finalScore);
    }
  }
}

