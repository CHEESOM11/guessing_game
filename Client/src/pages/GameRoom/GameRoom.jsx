import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import socket from "../../services/socket";

import PlayerList from "../../components/PlayerList/PlayerList";
import QuestionCard from "../../components/QuestionCard/QuestionCard";
import GuessForm from "../../components/GuessInput/GuessInput";
import ScoreBoard from "../../components/ScoreBoard/ScoreBoard";
import Timer from "../../components/Timer/Timer";
import WinnerModal from "../../components/WinnerTile/WinnerModal";

import "./GameRoom.css";

export default function GameRoom() {

    const navigate = useNavigate();

    const { state } = useLocation();

    const [players, setPlayers] = useState(state?.players || []);
    const [question, setQuestion] = useState(state?.question || "");
    const [timeLeft, setTimeLeft] = useState(60);
    const [winner, setWinner] = useState(null);
    const [answer, setAnswer] = useState("");
    const [showWinner, setShowWinner] = useState(false);

    useEffect(() => {

        socket.on("playersUpdated", (updatedPlayers) => {

            setPlayers(updatedPlayers);

        });

        socket.on("gameStarted", (data) => {

            setQuestion(data.question);
            setTimeLeft(60);

        });

        socket.on("timerUpdate", ({ timeLeft }) => {

            setTimeLeft(timeLeft);

        });

        socket.on("winnerDeclared", (data) => {

            setWinner(data.winner);
            setAnswer(data.answer);
            setPlayers(data.scores);
            setShowWinner(true);

        });

        socket.on("gameEnded", (data) => {

            setWinner(null);
            setAnswer(data.answer);
            setPlayers(data.scores);
            setShowWinner(true);

        });

        return () => {

            socket.off("playersUpdated");
            socket.off("gameStarted");
            socket.off("timerUpdate");
            socket.off("winnerDeclared");
            socket.off("gameEnded");

        };

    }, []);

    return (

        <div className="game-room">

            <h1> Guessing Game</h1>

            <Timer time={timeLeft} />

            <QuestionCard question={question} />

            <GuessForm
                sessionId={state.sessionId}
                username={state.username}
            />

            <PlayerList players={players} />

            <ScoreBoard players={players} />

            {

                showWinner &&

                <WinnerModal

                    winner={winner}

                    answer={answer}

                    onClose={() => {

                        setShowWinner(false);

                        navigate("/waiting", {

                            state

                        });

                    }}

                />

            }

        </div>

    );

}