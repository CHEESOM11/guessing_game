import { createContext, useState } from "react";

export const GameContext = createContext();

export function GameProvider({ children }) {

    const [session, setSession] = useState(null);

    const [players, setPlayers] = useState([]);

    const [question, setQuestion] = useState("");

    const [winner, setWinner] = useState(null);

    const [answer, setAnswer] = useState("");

    const [timer, setTimer] = useState(60);

    return (

        <GameContext.Provider
            value={{

                session,
                setSession,

                players,
                setPlayers,

                question,
                setQuestion,

                winner,
                setWinner,

                answer,
                setAnswer,

                timer,
                setTimer

            }}
        >

            {children}

        </GameContext.Provider>

    );

}