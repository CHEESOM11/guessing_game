import "./WinnerModal.css";

export default function WinnerModal({

    winner,

    answer,

    onClose

}) {

    return (

        <div className="modal-overlay">

            <div className="winner-modal">

                <h2>🏆 Game Over</h2>

                {

                    winner ?

                    <>
                        <h3>{winner} Won!</h3>
                        <p>Correct Answer:</p>
                        <h2>{answer}</h2>
                    </>

                    :

                    <>
                        <h3>No Winner</h3>
                        <p>Correct Answer:</p>
                        <h2>{answer}</h2>
                    </>

                }

                <button onClick={onClose}>

                    Continue

                </button>

            </div>

        </div>

    );

}