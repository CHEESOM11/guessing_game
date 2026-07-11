import { useState } from "react";
import socket from "../../services/socket";

export default function GuessForm({

    sessionId,
    username

}) {

    const [guess, setGuess] = useState("");

    const submitGuess = (e) => {

        e.preventDefault();

        if (!guess.trim()) return;

        socket.emit("guessAnswer", {

            sessionId,
            username,
            answer: guess

        });

        setGuess("");

    };

    return (

        <form
            onSubmit={submitGuess}
            className="guess-form"
        >

            <input

                type="text"

                placeholder="Enter your guess"

                value={guess}

                onChange={(e) => setGuess(e.target.value)}

            />

            <button>

                Send

            </button>

        </form>

    );

}