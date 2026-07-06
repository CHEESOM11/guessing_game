function ScoreBoard () {
    return (
        <div className="ScoreBoard">
            <h3>Scores</h3>
            {players.map((player) => (
                <div
                    key={player.username}
                    className="player-card">

                    <p>{player.username}</p>
                    <p>Score: {player.score}</p>
                </div>
            ))}
        </div>
    );
}

export default ScoreBoard;