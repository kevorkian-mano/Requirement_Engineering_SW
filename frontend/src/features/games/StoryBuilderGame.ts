import * as Phaser from 'phaser';

export class StoryBuilderGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private storyParts: string[] = [];
  private selectedParts: string[] = [];
  private partButtons: Phaser.GameObjects.Rectangle[] = [];
  private partLabels: Phaser.GameObjects.Text[] = [];
  private storyText!: Phaser.GameObjects.Text;
  private submitButton!: Phaser.GameObjects.Rectangle;
  private onScoreUpdate?: (score: number) => void;
  private feedbackText!: Phaser.GameObjects.Text;
  private stories: { parts: string[]; correct: string[] }[] = [
    {
      parts: ['Once upon a time', 'there was a', 'little girl', 'who loved', 'to read books'],
      correct: ['Once upon a time', 'there was a', 'little girl', 'who loved', 'to read books']
    },
    {
      parts: ['The sun', 'was shining', 'brightly', 'in the', 'blue sky'],
      correct: ['The sun', 'was shining', 'brightly', 'in the', 'blue sky']
    },
    {
      parts: ['A cat', 'jumped', 'over the', 'fence', 'and ran away'],
      correct: ['A cat', 'jumped', 'over the', 'fence', 'and ran away']
    },
    {
      parts: ['The children', 'played', 'in the park', 'all day', 'and had fun'],
      correct: ['The children', 'played', 'in the park', 'all day', 'and had fun']
    }
  ];
  private currentStory: { parts: string[]; correct: string[] } | null = null;
  private storyIndex: number = 0;

  constructor() {
    super({ key: 'StoryBuilderGame' });
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
    this.add.rectangle(400, 300, 800, 600, 0xFFF9E6);
    
    // Title
    this.add.text(400, 30, 'Story Builder', {
      fontSize: '42px',
      color: '#FF6B6B',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 30, 'Score: 0', {
      fontSize: '24px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    });

    // Instruction
    this.add.text(400, 80, 'Click words in order to build a story!', {
      fontSize: '22px',
      color: '#333333',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Story display area
    const storyArea = this.add.rectangle(400, 200, 700, 150, 0xFFFFFF, 0.8);
    storyArea.setStrokeStyle(3, 0x4ECDC4);

    this.storyText = this.add.text(400, 200, 'Your story will appear here...', {
      fontSize: '24px',
      color: '#666666',
      fontFamily: 'Arial',
      wordWrap: { width: 650 },
      align: 'center',
    }).setOrigin(0.5);

    // Create word buttons area
    this.add.text(400, 320, 'Click words in order:', {
      fontSize: '20px',
      color: '#333333',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    // Submit button
    this.submitButton = this.add.rectangle(400, 520, 200, 60, 0x4ECDC4);
    this.submitButton.setStrokeStyle(3, 0xFFFFFF);
    this.submitButton.setInteractive({ useHandCursor: true });

    this.add.text(400, 520, 'Submit Story', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5);

    this.submitButton.on('pointerdown', () => this.submitStory());

    // Feedback text
    this.feedbackText = this.add.text(400, 580, '', {
      fontSize: '28px',
      color: '#06D6A0',
      fontFamily: 'Arial',
      fontWeight: 'bold',
    }).setOrigin(0.5).setVisible(false);

    // Start first story
    this.loadStory();
  }

  loadStory() {
    this.currentStory = this.stories[this.storyIndex];
    this.selectedParts = [];
    
    // Shuffle parts
    this.storyParts = [...this.currentStory.parts].sort(() => Math.random() - 0.5);

    // Clear previous buttons
    this.partButtons.forEach(btn => btn.destroy());
    this.partLabels.forEach(lbl => lbl.destroy());
    this.partButtons = [];
    this.partLabels = [];

    // Create word buttons
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x06D6A0, 0xFFD93D, 0xAA96DA];
    const startX = 150;
    const startY = 380;
    const spacing = 130;
    const buttonWidth = 120;
    const buttonHeight = 50;

    this.storyParts.forEach((part, index) => {
      const x = startX + (index % 5) * spacing;
      const y = startY + Math.floor(index / 5) * spacing;

      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, buttonColors[index % 5], 1);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(2, 0xFFFFFF);
      button.setData('part', part);
      button.setData('index', index);

      const label = this.add.text(x, y, part, {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      }).setOrigin(0.5);

      button.on('pointerdown', () => this.selectPart(part, button));

      button.on('pointerover', () => {
        button.setScale(1.1);
      });

      button.on('pointerout', () => {
        button.setScale(1);
      });

      this.partButtons.push(button);
      this.partLabels.push(label);
    });

    this.updateStoryDisplay();
    this.feedbackText.setVisible(false);
  }

  selectPart(part: string, button: Phaser.GameObjects.Rectangle) {
    // Check if already selected
    if (this.selectedParts.includes(part)) {
      return;
    }

    this.selectedParts.push(part);
    button.setFillStyle(0x888888, 0.5);
    button.setInteractive(false);

    this.updateStoryDisplay();
  }

  updateStoryDisplay() {
    if (this.selectedParts.length === 0) {
      this.storyText.setText('Your story will appear here...');
      this.storyText.setStyle({ color: '#666666' });
    } else {
      this.storyText.setText(this.selectedParts.join(' '));
      this.storyText.setStyle({ color: '#333333' });
    }
  }

  submitStory() {
    if (!this.currentStory) return;

    if (this.selectedParts.length !== this.currentStory.correct.length) {
      this.showFeedback('Please select all words!', false);
      return;
    }

    // Check if story is correct
    const isCorrect = this.selectedParts.every((part, index) => 
      part === this.currentStory!.correct[index]
    );

    if (isCorrect) {
      this.score += 30;
      this.updateScore();
      this.showFeedback('🎉 Great Story! 🎉', true);

      this.time.delayedCall(2000, () => {
        this.storyIndex = (this.storyIndex + 1) % this.stories.length;
        this.loadStory();
      });
    } else {
      this.showFeedback('Try again! The order matters!', false);
      // Reset
      this.time.delayedCall(1500, () => {
        this.selectedParts = [];
        this.loadStory();
      });
    }
  }

  showFeedback(message: string, isSuccess: boolean) {
    this.feedbackText.setText(message);
    this.feedbackText.setStyle({ color: isSuccess ? '#06D6A0' : '#FF6B6B' });
    this.feedbackText.setVisible(true);
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }
}

