import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import socket from "../../services/socket";
import "./WaitingRoom.css";

export default function WaitingRoom() {

    const navigate = useNavigate();

    const { state } = useLocation();

    const [players, setPlayers] = useState(state?.players || []);

    const [gameMaster, setGameMaster] = useState(state?.gameMaster);

    const [sessionId] = useState(state?.sessionId);

    const [username] = useState(state?.username);

    useEffect(() => {

        socket.on("playersUpdated", ({ players, gameMaster }) => {

            setPlayers(players);

            setGameMaster(gameMaster);

        });

        socket.on("gameStarted", (data) => {

            navigate("/game", {

                state: {

                    sessionId,

                    username,

                    players,

                    question: data.question

                }

            });

        });

        socket.on("newGameMaster", ({ gameMaster }) => {

            setGameMaster(gameMaster);

        });

        return () => {

            socket.off("playersUpdated");

            socket.off("gameStarted");

            socket.off("newGameMaster");

        };

    }, []);

    const startGame = () => {

        socket.emit("startGame", {

            sessionId

        });

    };

    return (

        <div className="waiting-room">

            <div className="waiting-card">

                <h1>Guessing Game</h1>

                <h3>Waiting Room</h3>

                <div className="session-box">

                    Session ID: <br />

                    <h2>{sessionId}</h2>

                </div>

                <div className="player-count">

                    Players Connected: {players.length}

                </div>

                <div className="player-list">

                    {

                        players.map((player) => (

                            <div
                                className="player"
                                key={player.username}
                            >

                                {

                                    player.username === gameMaster

                                        ?

                                        <>👑 {player.username}</>

                                        :

                                        player.username

                                }

                            </div>

                        ))

                    }

                </div>

                {

                    players.length < 3 &&

                    <p className="waiting-message">

                        Waiting for more players...

                    </p>

                }

                {

                    username === gameMaster &&

                    <button

                        disabled={players.length < 3}

                        onClick={startGame}

                    >

                        Start Game

                    </button>

                }

            </div>

        </div>

    );

}