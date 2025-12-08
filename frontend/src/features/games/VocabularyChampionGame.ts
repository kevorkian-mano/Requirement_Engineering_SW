import * as Phaser from 'phaser';

export class VocabularyChampionGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private currentWord!: Phaser.GameObjects.Text;
  private options: Phaser.GameObjects.Text[] = [];
  private correctAnswer: string = '';
  private words: any[] = [];
  private wordIndex: number = 0;
  private correctCount: number = 0;
  private onScoreUpdate?: (score: number) => void;

  constructor() {
    super({ key: 'VocabularyChampionGame' });
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

    // Background gradient
    this.add.rectangle(400, 300, 800, 600, 0x2c3e50);
    
    // Title
    this.add.text(400, 50, 'Vocabulary Champion', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 50, 'Score: 0', {
      fontSize: '24px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
    });

    // Generate word pairs (English-Arabic)
    this.generateWords();
    this.showWord();

    // Instructions
    this.add.text(400, 550, 'Match the word with its meaning!', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
  }

  generateWords() {
    this.words = [
      { word: 'Cat', meaning: 'قطة', options: ['قطة', 'كلب', 'طائر', 'سمكة'] },
      { word: 'Dog', meaning: 'كلب', options: ['قطة', 'كلب', 'أسد', 'نمر'] },
      { word: 'Sun', meaning: 'شمس', options: ['قمر', 'شمس', 'نجمة', 'سحابة'] },
      { word: 'Moon', meaning: 'قمر', options: ['شمس', 'قمر', 'نجمة', 'كوكب'] },
      { word: 'Book', meaning: 'كتاب', options: ['قلم', 'كتاب', 'ورقة', 'ممحاة'] },
      { word: 'Water', meaning: 'ماء', options: ['نار', 'ماء', 'هواء', 'تراب'] },
      { word: 'House', meaning: 'بيت', options: ['مدرسة', 'بيت', 'مستشفى', 'متجر'] },
      { word: 'School', meaning: 'مدرسة', options: ['بيت', 'مدرسة', 'حديقة', 'شارع'] },
      { word: 'Friend', meaning: 'صديق', options: ['عدو', 'صديق', 'جار', 'معلم'] },
      { word: 'Happy', meaning: 'سعيد', options: ['حزين', 'سعيد', 'غاضب', 'خائف'] },
    ];

    // Shuffle options for each word
    this.words.forEach(word => {
      word.options = this.shuffleArray([...word.options]);
    });
  }

  shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  showWord() {
    if (this.wordIndex >= this.words.length) {
      this.endGame();
      return;
    }

    const currentWordData = this.words[this.wordIndex];
    this.correctAnswer = currentWordData.meaning;

    // Clear previous
    this.options.forEach(opt => opt.destroy());
    this.options = [];
    if (this.currentWord) {
      this.currentWord.destroy();
    }

    // Show word
    this.currentWord = this.add.text(400, 200, currentWordData.word, {
      fontSize: '48px',
      color: '#FFE66D',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Show options
    const optionY = 350;
    const spacing = 150;
    const startX = 400 - (spacing * (currentWordData.options.length - 1)) / 2;

    currentWordData.options.forEach((option: string, index: number) => {
      const optionText = this.add.text(startX + spacing * index, optionY, option, {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: '#4ECDC4',
        padding: { x: 20, y: 15 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      optionText.on('pointerdown', () => {
        this.selectOption(option, optionText);
      });

      optionText.on('pointerover', () => {
        optionText.setStyle({ backgroundColor: '#06D6A0' });
      });

      optionText.on('pointerout', () => {
        optionText.setStyle({ backgroundColor: '#4ECDC4' });
      });

      this.options.push(optionText);
    });
  }

  selectOption(selected: string, optionText: Phaser.GameObjects.Text) {
    // Disable all options
    this.options.forEach(opt => {
      opt.disableInteractive();
    });

    if (selected === this.correctAnswer) {
      // Correct!
      this.correctCount++;
      this.score += 10;
      this.updateScore();
      optionText.setStyle({ backgroundColor: '#06D6A0', color: '#ffffff' });

      const feedback = this.add.text(400, 450, '✓ Correct! +10 points', {
        fontSize: '28px',
        color: '#06D6A0',
        fontFamily: 'Arial',
      }).setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        feedback.destroy();
        this.wordIndex++;
        this.showWord();
      });
    } else {
      // Wrong
      optionText.setStyle({ backgroundColor: '#FF6B6B', color: '#ffffff' });
      
      // Highlight correct answer
      const correctOption = this.options.find(opt => opt.text === this.correctAnswer);
      if (correctOption) {
        correctOption.setStyle({ backgroundColor: '#06D6A0', color: '#ffffff' });
      }

      const feedback = this.add.text(400, 450, `✗ Wrong! Correct: ${this.correctAnswer}`, {
        fontSize: '24px',
        color: '#FF6B6B',
        fontFamily: 'Arial',
      }).setOrigin(0.5);

      this.time.delayedCall(1500, () => {
        feedback.destroy();
        this.wordIndex++;
        this.showWord();
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
    this.options.forEach(opt => opt.destroy());
    if (this.currentWord) {
      this.currentWord.destroy();
    }

    const completionRate = (this.correctCount / this.words.length) * 100;
    const finalScore = this.score + (completionRate > 80 ? 50 : 0);

    this.add.rectangle(400, 300, 600, 400, 0x2a2a4e, 0.95);
    this.add.text(400, 200, 'Game Complete!', {
      fontSize: '40px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 280, `Final Score: ${finalScore}`, {
      fontSize: '32px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 340, `Correct: ${this.correctCount}/${this.words.length}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    if (this.onScoreUpdate) {
      this.onScoreUpdate(finalScore);
    }
  }
}

