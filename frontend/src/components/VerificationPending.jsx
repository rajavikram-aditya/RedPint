import './VerificationPending.css';

export default function VerificationPending({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content verification-modal">
        <div className="verification-icon">✉️</div>
        <h2>Verification Pending</h2>
        <p>
          Your account has been created successfully! Please verify your email
          or phone number to activate your account.
        </p>
        <p className="verification-note">
          Check your inbox for the verification link, or complete the OTP
          verification sent to your phone.
        </p>
        <button className="btn-primary" onClick={onClose}>
          I've Verified — Continue
        </button>
      </div>
    </div>
  );
}
