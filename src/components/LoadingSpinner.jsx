const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-spinner-container">
    <div className="loading-spinner" />
    <p className="loading-text">{text}</p>
  </div>
);

export default LoadingSpinner;
