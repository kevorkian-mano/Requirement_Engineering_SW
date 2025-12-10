import * as Phaser from 'phaser';

export class JavaBasicsGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;
  private onScoreUpdate?: (score: number) => void;
  private instructionText!: Phaser.GameObjects.Text;
  private currentChallenge: any = null;
  private answerInput!: HTMLInputElement;
  private feedbackText!: Phaser.GameObjects.Text;
  private challenges: any[] = [];
  private challengeIndex: number = 0;
  private hintsUsed: number = 0;
  private levelStartTime: number = 0;
  private codeText!: Phaser.GameObjects.Text;
  private explanationText!: Phaser.GameObjects.Text;
  private hintButton!: Phaser.GameObjects.Rectangle;
  private hintButtonText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Rectangle[] = [];
  private optionTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'JavaBasicsGame' });
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
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // Title
    this.add.text(400, 30, 'Java Basics', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score and Level display
    this.scoreText = this.add.text(50, 70, 'Score: 0', {
      fontSize: '20px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
    });

    this.levelText = this.add.text(50, 100, 'Level: 1/4', {
      fontSize: '20px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    });

    // Instruction
    this.instructionText = this.add.text(400, 140, 'Complete the Java code challenge!', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Feedback text
    this.feedbackText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#95E1D3',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.levelStartTime = Date.now();
    this.generateChallenges();
    this.showChallenge();
  }

  generateChallenges() {
    this.challenges = [
      // Level 1: Variables
      {
        level: 1,
        type: 'variable_declaration',
        code: 'int _____ = 5;',
        explanation: 'Complete the variable declaration',
        answer: 'counter',
        options: ['counter', 'sum', 'variable', 'number'],
        points: 10,
      },
      {
        level: 1,
        type: 'variable_declaration',
        code: 'String _____ = "Hello";',
        explanation: 'Declare a String variable',
        answer: 'greeting',
        options: ['greeting', 'name', 'message', 'text'],
        points: 10,
      },
      {
        level: 1,
        type: 'data_type',
        code: 'Which data type for a whole number?\n_____ age = 10;',
        explanation: 'Select the correct data type',
        answer: 'int',
        options: ['int', 'String', 'double', 'boolean'],
        points: 10,
      },
      // Level 2: Methods
      {
        level: 2,
        type: 'method_call',
        code: 'public void ______(String name) {\n  System.out.println("Hello " + name);\n}',
        explanation: 'Name this greeting method',
        answer: 'greet',
        options: ['greet', 'sayHi', 'hello', 'introduce'],
        points: 12,
      },
      {
        level: 2,
        type: 'method_order',
        code: 'Arrange in correct order:\n1. System.out.println("Hello");\n2. String name = "Java";\n3. int age = 10;',
        explanation: 'Correct order is: 3, 2, 1',
        answer: '3,2,1',
        options: ['3,2,1', '1,2,3', '2,3,1', '2,1,3'],
        points: 15,
      },
      // Level 3: Loops
      {
        level: 3,
        type: 'loop_syntax',
        code: 'for (int i = 0; i _____ 10; i++) {\n  // Do something\n}',
        explanation: 'What comparison operator goes here?',
        answer: '<',
        options: ['<', '>', '<=', '>='],
        points: 15,
      },
      {
        level: 3,
        type: 'conditional',
        code: 'if (age _____ 18) {\n  System.out.println("Adult");\n}',
        explanation: 'What operator checks if age is 18 or more?',
        answer: '>=',
        options: ['>=', '>', '<=', '<'],
        points: 15,
      },
      // Level 4: OOP
      {
        level: 4,
        type: 'class_definition',
        code: 'public _____ Person {\n  private String name;\n}',
        explanation: 'What keyword defines a class?',
        answer: 'class',
        options: ['class', 'object', 'type', 'entity'],
        points: 20,
      },
      {
        level: 4,
        type: 'constructor',
        code: 'public ______(String personName) {\n  this.name = personName;\n}',
        explanation: 'This is a constructor. What is its name?',
        answer: 'Person',
        options: ['Person', 'init', 'new', 'create'],
        points: 20,
      },
    ];
  }

  showChallenge() {
    if (this.challengeIndex >= this.challenges.length) {
      this.endGame();
      return;
    }

    // Clear previous elements
    if (this.codeText) this.codeText.destroy();
    if (this.explanationText) this.explanationText.destroy();
    if (this.hintButton) this.hintButton.destroy();
    if (this.hintButtonText) this.hintButtonText.destroy();
    
    // Clear option buttons from previous challenge
    this.optionButtons.forEach(btn => btn.destroy());
    this.optionTexts.forEach(txt => txt.destroy());
    this.optionButtons = [];
    this.optionTexts = [];

    if (this.answerInput) {
      this.answerInput.remove();
    }

    this.currentChallenge = this.challenges[this.challengeIndex];
    this.currentLevel = this.currentChallenge.level;

    this.levelText.setText(`Level: ${this.currentLevel}/4`);
    this.feedbackText.setText('');

    // Show code challenge
    this.codeText = this.add.text(400, 220, this.currentChallenge.code, {
      fontSize: '20px',
      color: '#FFE66D',
      fontFamily: 'Courier',
      align: 'center',
    }).setOrigin(0.5);

    // Show explanation
    this.explanationText = this.add.text(400, 300, this.currentChallenge.explanation, {
      fontSize: '16px',
      color: '#95E1D3',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 700 },
    }).setOrigin(0.5);

    // Create input field or option buttons
    if (this.currentChallenge.type === 'method_order') {
      this.showOrderChallenge();
    } else {
      this.showMultipleChoice();
    }

    // Hint button
    this.hintButton = this.add.rectangle(700, 100, 80, 40, 0x95E1D3);
    this.hintButton.setInteractive({ useHandCursor: true });
    this.hintButtonText = this.add.text(700, 100, 'Hint', {
      fontSize: '14px',
      color: '#1a1a2e',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.hintButton.on('pointerdown', () => {
      this.showHint();
      this.hintButton.destroy();
      this.hintButtonText.destroy();
    });
  }

  showMultipleChoice() {
    const options = this.currentChallenge.options;
    const optionsY = 380;
    const optionSpacing = 100;
    const startX = 150;

    options.forEach((option: string, index: number) => {
      const optionRect = this.add.rectangle(
        startX + index * optionSpacing,
        optionsY,
        90,
        50,
        0x4ECDC4,
      );
      optionRect.setStrokeStyle(2, 0xffffff);
      optionRect.setInteractive({ useHandCursor: true });

      const optionText = this.add.text(
        startX + index * optionSpacing,
        optionsY,
        option,
        {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'Arial',
          wordWrap: { width: 80 },
          align: 'center',
        },
      ).setOrigin(0.5);

      // Store references for cleanup
      this.optionButtons.push(optionRect);
      this.optionTexts.push(optionText);

      optionRect.on('pointerdown', () => {
        this.checkAnswer(option, optionRect, optionText);
      });

      optionRect.on('pointerover', () => {
        optionRect.setFillStyle(0x6DD5D2);
      });

      optionRect.on('pointerout', () => {
        optionRect.setFillStyle(0x4ECDC4);
      });
    });
  }

  showOrderChallenge() {
    // For order-based challenges, show as drag-drop or input
    this.answerInput = document.createElement('input');
    this.answerInput.type = 'text';
    this.answerInput.placeholder = 'Enter order (e.g., 3,2,1)';
    this.answerInput.style.width = '300px';
    this.answerInput.style.height = '40px';
    this.answerInput.style.fontSize = '16px';
    this.answerInput.style.position = 'absolute';
    this.answerInput.style.left = '250px';
    this.answerInput.style.top = '380px';
    this.answerInput.style.padding = '10px';
    this.answerInput.style.borderRadius = '5px';
    this.answerInput.style.border = '2px solid #4ECDC4';
    this.answerInput.style.backgroundColor = '#1a1a2e';
    this.answerInput.style.color = '#4ECDC4';

    document.body.appendChild(this.answerInput);
    this.answerInput.focus();

    this.answerInput.onkeypress = (event) => {
      if (event.key === 'Enter') {
        this.checkAnswer(this.answerInput.value.trim(), null, null);
      }
    };
  }

  checkAnswer(userAnswer: string, rect?: Phaser.GameObjects.Rectangle, text?: Phaser.GameObjects.Text) {
    const correct = userAnswer === this.currentChallenge.answer;

    if (correct) {
      this.feedbackText.setText('✓ Correct!');
      this.feedbackText.setColor('#95E1D3');

      // Calculate points with speed bonus
      const elapsedSeconds = (Date.now() - this.levelStartTime) / 1000;
      let points = this.currentChallenge.points;

      // Speed bonus: 5 extra points if solved in under 15 seconds
      if (elapsedSeconds < 15) {
        points += 5;
      }

      // No hints bonus: 5 extra points
      if (this.hintsUsed === 0) {
        points += 5;
      }

      this.updateScore(points);

      // Change button color to green
      if (rect) {
        rect.setFillStyle(0x95E1D3);
      }

      // Move to next challenge
      setTimeout(() => {
        this.challengeIndex++;
        this.levelStartTime = Date.now();
        this.hintsUsed = 0;
        this.showChallenge();
      }, 1500);
    } else {
      this.feedbackText.setText('✗ Try again!');
      this.feedbackText.setColor('#FF6B6B');

      if (rect) {
        rect.setFillStyle(0xFF6B6B);
        setTimeout(() => rect.setFillStyle(0x4ECDC4), 500);
      }
    }
  }

  showHint() {
    this.hintsUsed++;
    const challenge = this.currentChallenge;

    let hintMessage = '';
    switch (challenge.type) {
      case 'variable_declaration':
        hintMessage = `Hint: Variables need a name. The answer is one of the options!`;
        break;
      case 'data_type':
        hintMessage = `Hint: For whole numbers, use 'int'. For text, use 'String'.`;
        break;
      case 'method_call':
        hintMessage = `Hint: Method names usually describe what they do.`;
        break;
      case 'loop_syntax':
        hintMessage = `Hint: The loop runs while i is less than 10.`;
        break;
      case 'conditional':
        hintMessage = `Hint: >= means "greater than or equal to".`;
        break;
      default:
        hintMessage = `Hint: Look at the code structure carefully.`;
    }

    this.feedbackText.setText(hintMessage);
    this.feedbackText.setColor('#FFE66D');
  }

  private updateScore(points: number) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  private endGame() {
    // Cleanup
    if (this.answerInput) {
      this.answerInput.remove();
    }

    // Show completion screen
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
    this.add.text(400, 200, 'Level Complete!', {
      fontSize: '48px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(400, 300, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 380, 'Great job learning Java!', {
      fontSize: '24px',
      color: '#95E1D3',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }

    setTimeout(() => this.scene.stop(), 3000);
  }
}
