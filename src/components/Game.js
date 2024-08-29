import React, { Component } from 'react';
import { Howl } from 'howler';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure Font Awesome is imported
import './Game.css'; 

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playerScore: 0,
            compScore: 0,
            round: 1,
            totalRounds: 5,
            history: [],
            leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || [],
            soundEnabled: true,
            difficulty: 'medium'
        };

        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.toggleSound = this.toggleSound.bind(this);
        this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    }

    initializeSounds = () => {
        if (!this.soundInitialized) {
            this.clickSound = new Howl({
                src: ['/sounds/click.mp3'],
                volume: 1,
                html5: true
            });

            this.winSound = new Howl({
                src: ['/sounds/win.mp3'],
                volume: 1,
                html5: true
            });

            this.loseSound = new Howl({
                src: ['/sounds/lose.mp3'],
                volume: 1,
                html5: true
            });

            this.soundInitialized = true;
        }
    }

    playSound = (sound) => {
        if (this.state.soundEnabled) {
            sound.play();
        }
    }

    logic = (playerChoice, compChoice) => {
        if (playerChoice === compChoice) return 0;
        if (
            (playerChoice === "ROCK" && compChoice === "SCISSORS") ||
            (playerChoice === "PAPER" && compChoice === "ROCK") ||
            (playerChoice === "SCISSORS" && compChoice === "PAPER")
        ) return 1;
        return -1;
    }

    decision = (playerChoice) => {
        this.initializeSounds(); // Ensure sounds are initialized

        const choices = ["ROCK", "PAPER", "SCISSORS"];
        let compChoice;
        if (this.state.difficulty === 'easy') {
            compChoice = choices[Math.floor(Math.random() * choices.length)];
        } else if (this.state.difficulty === 'medium') {
            compChoice = choices[(choices.indexOf(playerChoice) + 1) % 3];
        } else if (this.state.difficulty === 'hard') {
            compChoice = this.advancedStrategy(playerChoice);
        }

        this.playSound(this.clickSound); // Play click sound on choice

        const result = this.logic(playerChoice, compChoice);
        const newHistory = [...this.state.history, {
            round: this.state.round,
            playerVal: playerChoice,
            computerVal: compChoice,
            result: result === 1 ? 'Win' : result === -1 ? 'Lose' : 'Draw'
        }];

        if (result === 1) {
            this.playSound(this.winSound); // Play win sound
            this.setState(prevState => ({
                playerScore: prevState.playerScore + 1,
                history: newHistory,
            }));
        } else if (result === -1) {
            this.playSound(this.loseSound); // Play lose sound
            this.setState(prevState => ({
                compScore: prevState.compScore + 1,
                history: newHistory,
            }));
        } else {
            this.setState({
                history: newHistory,
            });
        }

        this.setState(prevState => ({
            round: prevState.round + 1,
        }), this.checkWinner);
    }

    advancedStrategy = (playerChoice) => {
        const choices = ["ROCK", "PAPER", "SCISSORS"];
        const counterChoice = {
            "ROCK": "PAPER",
            "PAPER": "SCISSORS",
            "SCISSORS": "ROCK"
        };
        return counterChoice[playerChoice] || choices[Math.floor(Math.random() * choices.length)];
    }

    updateLeaderboard = () => {
        const { playerScore, leaderboard } = this.state;
        const newEntry = {
            name: 'Player',
            score: playerScore,
            date: new Date().toLocaleString()
        };

        const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
        this.setState({ leaderboard: updatedLeaderboard });
        localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
    }

    checkWinner = () => {
        if (this.state.round > this.state.totalRounds) {
            const winner = this.state.playerScore > this.state.compScore ? 'Player' : 'Computer';
            alert(`Game Over! ${winner} wins!`);
            this.updateLeaderboard();
            this.setState({
                playerScore: 0,
                compScore: 0,
                round: 1,
                history: []
            });
        }
    }

    handleButtonClick(choice) {
        this.initializeSounds(); // Ensure sounds are initialized
        this.decision(choice);
    }

    toggleSound() {
        this.setState(prevState => ({ soundEnabled: !prevState.soundEnabled }));
    }

    handleDifficultyChange(event) {
        this.setState({ difficulty: event.target.value });
    }

    componentDidMount() {
        window.addEventListener('click', this.initializeSounds);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.initializeSounds);
    }

    render() {
        const { playerScore, compScore, round, totalRounds, history, leaderboard, difficulty } = this.state;

        return (
            <div className="container">
                <h1>Rock, Paper, Scissors</h1>
                <button onClick={() => this.handleButtonClick("ROCK")}><i className="fa fa-hand-rock"></i></button>
                <button onClick={() => this.handleButtonClick("PAPER")}><i className="fa fa-hand-paper"></i></button>
                <button onClick={() => this.handleButtonClick("SCISSORS")}><i className="fa fa-hand-scissors"></i></button>
                <div className="content">
                    <h2>Scores</h2>
                    <p>Player: {playerScore}</p>
                    <p>Computer: {compScore}</p>
                    <h3>Round {round} of {totalRounds}</h3>
                    <h2>History</h2>
                    <ul>
                        {history.map((entry, index) => (
                            <li key={index}>{`Round ${entry.round}: Player chose ${entry.playerVal}, Computer chose ${entry.computerVal} - ${entry.result}`}</li>
                        ))}
                    </ul>
                </div>
                <div className="content">
                    <h2>Leaderboard</h2>
                    <ul>
                        {leaderboard.map((entry, index) => (
                            <li key={index}>{`${entry.name} - Score: ${entry.score} (Date: ${entry.date})`}</li>
                        ))}
                    </ul>
                </div>
                <div className="content">
                    <label>
                        Difficulty:
                        <select value={difficulty} onChange={this.handleDifficultyChange}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </label>
                </div>
                <div className="content">
                    <button onClick={this.toggleSound}>{this.state.soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}</button>
                </div>
            </div>
        );
    }
}

export default Game;
