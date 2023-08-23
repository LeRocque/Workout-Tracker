import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUserActionCreator } from "../actions/actions";
import { SignupModal } from "../components/SignupModal";
import { useAppDispatch } from "../hooks";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleModal = () => {
    setShowSignupModal(!showSignupModal);
  };

  const handleSetUsername = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };
  const handleSetPassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      setUsername("");
      setPassword("");
      if (response.ok) {
        const returnedUserId = await response.json();
        const returnedId = returnedUserId.user_id;
        dispatch(loginUserActionCreator(username));
        navigate(`/home/${returnedId}`);
      } else if (response.status === 401) {
        alert("Invalid username or password");
      } else if (response.status === 400) {
        alert("both fields required");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      <div
        id="login-container"
        className="mb-10 w-full bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 p-7 text-center"
      >
        <div>Welcome to Workout Tracker!</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            name="username"
            placeholder="Enter your username"
            value={username}
            onChange={handleSetUsername}
          />
          <input
            type="password"
            required
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={handleSetPassword}
          />
          <button
            className="text-2xl text-white outline hover:text-gray-200"
            type="submit"
          >
            Login
          </button>
        </form>
        <button className="frontendButton" onClick={handleModal}>
          Signup
        </button>
      </div>
      {showSignupModal && <SignupModal handleModal={handleModal} />}
    </div>
  );
};
