import "./Loading.css";

export default function Loading({ message = "Loading..." }) {

    return (

        <div className="loading-container">

            <div className="spinner"></div>

            <h3>{message}</h3>

        </div>

    );

}