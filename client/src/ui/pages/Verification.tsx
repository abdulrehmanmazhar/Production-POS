// pages/Verification.tsx
import "./styles/verification.css"

const Verification = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Verification</h2>
      <form>
        <div>
          <label>Verification Code:</label>
          <input type="text" placeholder="Enter verification code" required />
        </div>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default Verification;
