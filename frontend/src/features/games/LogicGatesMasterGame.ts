import * as Phaser from 'phaser';

interface LogicGate {
  x: number;
  y: number;
  type: 'AND' | 'OR' | 'NOT' | 'NAND';
  inputA?: boolean;
  inputB?: boolean;
  output?: boolean;
}

export class LogicGatesMasterGame extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private currentLevel: number = 1;
  private onScoreUpdate?: (score: number) => void;
  private instructionText!: Phaser.GameObjects.Text;
  private gates: LogicGate[] = [];
  private challenges: any[] = [];
  private challengeIndex: number = 0;
  private currentChallenge: any = null;
  private feedbackText!: Phaser.GameObjects.Text;
  private truthTableText!: Phaser.GameObjects.Text;
  private testInputs: { A: boolean; B: boolean }[] = [];
  private testIndex: number = 0;
  private gateElements: Map<number, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'LogicGatesMasterGame' });
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
    this.add.rectangle(400, 300, 800, 600, 0x1e1e2e);

    // Title
    this.add.text(400, 20, 'Logic Gates Master', {
      fontSize: '32px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score and Level
    this.scoreText = this.add.text(50, 50, 'Score: 0', {
      fontSize: '18px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    });

    this.levelText = this.add.text(50, 75, 'Level: 1/3', {
      fontSize: '18px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    });

    // Instruction
    this.instructionText = this.add.text(400, 110, 'Select the correct gate for the truth table!', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Feedback text
    this.feedbackText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#95E1D3',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Truth table display
    this.truthTableText = this.add.text(650, 300, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Courier',
    }).setOrigin(0, 0);

    this.generateChallenges();
    this.showChallenge();
  }

  generateChallenges() {
    this.challenges = [
      // Level 1: Single Gates
      {
        level: 1,
        name: 'AND Gate',
        truthTable: [
          { A: false, B: false, result: false },
          { A: false, B: true, result: false },
          { A: true, B: false, result: false },
          { A: true, B: true, result: true },
        ],
        correctGate: 'AND',
        points: 15,
      },
      {
        level: 1,
        name: 'OR Gate',
        truthTable: [
          { A: false, B: false, result: false },
          { A: false, B: true, result: true },
          { A: true, B: false, result: true },
          { A: true, B: true, result: true },
        ],
        correctGate: 'OR',
        points: 15,
      },
      {
        level: 1,
        name: 'NOT Gate',
        truthTable: [
          { A: false, result: true },
          { A: true, result: false },
        ],
        correctGate: 'NOT',
        points: 15,
      },
      {
        level: 1,
        name: 'NAND Gate',
        truthTable: [
          { A: false, B: false, result: true },
          { A: false, B: true, result: true },
          { A: true, B: false, result: true },
          { A: true, B: true, result: false },
        ],
        correctGate: 'NAND',
        points: 15,
      },
      // Level 2: Simple Circuits
      {
        level: 2,
        name: 'Simple Circuit 1',
        description: 'Use AND and NOT gates to create: (A AND B) NOT',
        correctGate: 'NAND',
        points: 25,
      },
      {
        level: 2,
        name: 'Simple Circuit 2',
        description: 'Create a circuit that outputs true only when A is true',
        correctGate: 'AND',
        points: 25,
      },
      // Level 3: Complex Circuits
      {
        level: 3,
        name: 'Complex Logic 1',
        description: 'Build a circuit: (A OR B) AND (NOT C)',
        gatesNeeded: 3,
        points: 40,
      },
      {
        level: 3,
        name: 'Complex Logic 2',
        description: 'Create a majority voting circuit (output true if 2+ inputs are true)',
        gatesNeeded: 5,
        points: 50,
      },
    ];
  }

  showChallenge() {
    if (this.challengeIndex >= this.challenges.length) {
      this.endGame();
      return;
    }

    this.currentChallenge = this.challenges[this.challengeIndex];
    this.currentLevel = this.currentChallenge.level;

    this.levelText.setText(`Level: ${this.currentLevel}/3`);
    this.feedbackText.setText('');

    // Clear previous gates
    this.gateElements.forEach(el => el.destroy());
    this.gateElements.clear();
    this.gates = [];

    // Update instruction
    this.instructionText.setText(this.currentChallenge.description || 'Identify the correct logic gate!');

    if (this.currentLevel === 1) {
      this.showTruthTableChallenge();
    } else {
      this.showCircuitChallenge();
    }
  }

  showTruthTableChallenge() {
    const truthTable = this.currentChallenge.truthTable;

    // Display truth table
    let tableStr = 'A | B | Out\n---------\n';
    truthTable.forEach((row: any) => {
      const a = row.A ? '1' : '0';
      const b = row.B !== undefined ? row.B ? '1' : '0' : '-';
      const out = row.result ? '1' : '0';
      tableStr += `${a} | ${b} | ${out}\n`;
    });

    this.truthTableText.setText(tableStr);

    // Gate options
    const gates = ['AND', 'OR', 'NOT', 'NAND'];
    const gateY = 350;
    const gateSpacing = 140;
    const startX = 100;

    gates.forEach((gate, index) => {
      const gateRect = this.add.rectangle(
        startX + index * gateSpacing,
        gateY,
        100,
        80,
        this.getGateColor(gate),
      );
      gateRect.setStrokeStyle(3, 0xffffff);
      gateRect.setInteractive({ useHandCursor: true });

      const gateText = this.add.text(
        startX + index * gateSpacing,
        gateY,
        gate,
        {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold',
        },
      ).setOrigin(0.5);

      gateRect.on('pointerdown', () => {
        this.checkGateAnswer(gate, gateRect, gateText);
      });

      gateRect.on('pointerover', () => {
        gateRect.setStrokeStyle(3, 0xFFE66D);
      });

      gateRect.on('pointerout', () => {
        gateRect.setStrokeStyle(3, 0xffffff);
      });
    });
  }

  showCircuitChallenge() {
    // For advanced levels, show circuit building interface
    this.add.text(400, 250, 'Circuit Building Coming Soon!', {
      fontSize: '24px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 290, 'Try to understand the logic described above', {
      fontSize: '16px',
      color: '#95E1D3',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // For now, show gate selection for circuit challenges too
    const gates = ['AND', 'OR', 'NOT', 'NAND'];
    const gateY = 380;
    const gateSpacing = 140;
    const startX = 100;

    gates.forEach((gate, index) => {
      const gateRect = this.add.rectangle(
        startX + index * gateSpacing,
        gateY,
        100,
        80,
        this.getGateColor(gate),
      );
      gateRect.setStrokeStyle(3, 0xffffff);
      gateRect.setInteractive({ useHandCursor: true });

      const gateText = this.add.text(
        startX + index * gateSpacing,
        gateY,
        gate,
        {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold',
        },
      ).setOrigin(0.5);

      gateRect.on('pointerdown', () => {
        this.checkCircuitAnswer(gate, gateRect);
      });

      gateRect.on('pointerover', () => {
        gateRect.setStrokeStyle(3, 0xFFE66D);
      });

      gateRect.on('pointerout', () => {
        gateRect.setStrokeStyle(3, 0xffffff);
      });
    });
  }

  checkGateAnswer(selectedGate: string, rect: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text) {
    const correct = selectedGate === this.currentChallenge.correctGate;

    if (correct) {
      this.feedbackText.setText('✓ Correct! Well done!');
      this.feedbackText.setColor('#95E1D3');

      // Award points
      this.updateScore(this.currentChallenge.points);

      // Visual feedback
      rect.setFillStyle(this.getGateColor(selectedGate));
      rect.setStrokeStyle(3, 0x95E1D3);

      // Move to next challenge
      setTimeout(() => {
        this.challengeIndex++;
        this.showChallenge();
      }, 1500);
    } else {
      this.feedbackText.setText(`✗ Not quite. The answer is: ${this.currentChallenge.correctGate}`);
      this.feedbackText.setColor('#FF6B6B');

      // Red flash
      rect.setFillStyle(0xFF6B6B);
      setTimeout(() => {
        rect.setFillStyle(this.getGateColor(selectedGate));
      }, 500);
    }
  }

  checkCircuitAnswer(selectedGate: string, rect: Phaser.GameObjects.Rectangle) {
    // For circuit challenges, accept any valid gate as partial credit
    this.feedbackText.setText(`You selected ${selectedGate}. Great start!`);
    this.feedbackText.setColor('#FFE66D');

    this.updateScore(5);

    // Move to next challenge
    setTimeout(() => {
      this.challengeIndex++;
      this.showChallenge();
    }, 2000);
  }

  getGateColor(gate: string): number {
    switch (gate) {
      case 'AND':
        return 0x4ECDC4; // Cyan
      case 'OR':
        return 0x95E1D3; // Light cyan
      case 'NOT':
        return 0xA8E6CF; // Mint
      case 'NAND':
        return 0xFFE66D; // Yellow
      default:
        return 0x6c757d; // Gray
    }
  }

  private updateScore(points: number) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  private endGame() {
    // Show completion screen
    this.add.rectangle(400, 300, 800, 600, 0x1e1e2e);

    this.add.text(400, 180, 'Outstanding!', {
      fontSize: '48px',
      color: '#4ECDC4',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(400, 280, `Final Score: ${this.score}`, {
      fontSize: '36px',
      color: '#FFE66D',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 360, 'You\'ve mastered logic gates!', {
      fontSize: '20px',
      color: '#95E1D3',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.add.text(400, 420, 'You can now build more complex circuits.', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }

    setTimeout(() => this.scene.stop(), 4000);
  }
}
