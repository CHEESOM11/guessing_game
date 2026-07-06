import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createSession = () => {
    setError("");

    if (!username.trim()) {
      return setError("Please enter your username.");
    }

    setLoading(true);

    socket.emit("createSession", username.trim());
  };

  const joinSession = () => {
    setError("");

    if (!username.trim()) {
      return setError("Please enter your username.");
    }

    if (!sessionId.trim()) {
      return setError("Please enter a session code.");
    }

    setLoading(true);

    socket.emit("joinSession", {
      username: username.trim(),
      sessionCode: sessionId.trim().toUpperCase(),
    });
  };

  useEffect(() => {
    socket.on("sessionCreated", (session) => {
      setLoading(false);

      navigate("/game", {
        state: {
          session,
          username,
        },
      });
    });

    socket.on("playersUpdated", () => {
      setLoading(false);

      navigate("/game", {
        state: {
          sessionId,
          username,
        },
      });
    });

    socket.on("errorMessage", (message) => {
      setLoading(false);
      setError(message);
    });

    return () => {
      socket.off("sessionCreated");
      socket.off("playersUpdated");
      socket.off("errorMessage");
    };
  }, [navigate, username, sessionId]);

  return (
    <div className="home">

      <div className="card">

        <h1> Guessing Game</h1>

        <p>
          Create a session or join your friends.
        </p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Session Code"
          value={sessionId}
          onChange={(e) =>
            setSessionId(e.target.value)
          }
        />

        <button
          onClick={createSession}
          disabled={loading}
        >
          Create Session
        </button>

        <button
          onClick={joinSession}
          disabled={loading}
          className="join"
        >
          Join Session
        </button>

      </div>

    </div>
  );
}

export default Home;