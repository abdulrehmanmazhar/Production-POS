// pages/SignUp.tsx
import "./styles/signup.css"
const SignUp = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Sign Up</h2>
      <form>
        <div>
          <label>Name:</label>
          <input type="text" placeholder="Enter your name" required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" placeholder="Enter your email" required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" placeholder="Enter your password" required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
