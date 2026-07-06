export default function PlayerList({ players }) {

    return (

        <div className="player-list">

            <h3>Players</h3>

            {

                players.map((player) => (

                    <div
                        key={player.username}
                        className="player-card"
                    >

                        <p>{player.username}</p>

                        <p>Attempts: {player.attempts}</p>

                    </div>

                ))

            }

        </div>

    );

}