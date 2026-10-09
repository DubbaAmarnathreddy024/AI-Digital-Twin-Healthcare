import { useState } from "react";
import { Heart, Eye, EyeOff, Loader2 } from "lucide-react";

import { API_URL } from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Please enter your username and password."
      );
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append(
        "username",
        username.trim()
      );

      params.append(
        "password",
        password
      );

      const response = await fetch(
        `${API_URL}/auth/login?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Invalid username or password."
        );
      }

      if (!data?.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      // ========================================================
      // SAVE AUTH DATA
      // ========================================================

      localStorage.setItem(
        "healthTwinToken",
        data.access_token
      );

      localStorage.setItem(
        "healthTwinUser",
        JSON.stringify(data.user)
      );

      console.log(
        "LOGIN SUCCESS:",
        data.user
      );

      // ========================================================
      // SEND USER TO APP
      // ========================================================

      onLogin(data.user);

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      if (
        err?.message ===
        "Failed to fetch"
      ) {
        setError(
          "Unable to connect to the HealthTwin server. Please make sure the FastAPI backend is running."
        );
      } else {
        setError(
          err?.message ||
            "Unable to sign in."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="login-page">

      <div className="login-background">

        <div className="login-card">

          {/* ==================================================
              LOGO
              ================================================== */}

          <div className="login-logo">

            <div className="login-logo-icon">
              <Heart size={25} fill="currentColor" />
            </div>

            <div>

              <h1>
                HealthTwin AI
              </h1>

              <p>
                Personalized Healthcare Monitoring
              </p>

            </div>

          </div>

          {/* ==================================================
              HEADING
              ================================================== */}

          <div className="login-heading">

            <h2>
              Sign In
            </h2>

            <p>
              Sign in to access your personalized
              Digital Twin.
            </p>

          </div>

          {/* ==================================================
              LOGIN FORM
              ================================================== */}

          <form onSubmit={handleSubmit}>

            {/* Username */}

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              placeholder="Enter your username"
              autoComplete="username"
              disabled={loading}
            />

            {/* Password */}

            <label htmlFor="password">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                disabled={loading}
              >
                {showPassword ? (
                  <>
                    <EyeOff
                      size={14}
                      style={{
                        verticalAlign:
                          "middle",
                        marginRight: "4px",
                      }}
                    />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye
                      size={14}
                      style={{
                        verticalAlign:
                          "middle",
                        marginRight: "4px",
                      }}
                    />
                    Show
                  </>
                )}
              </button>

            </div>

            {/* Error */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Sign In */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <Loader2
                    size={16}
                    style={{
                      verticalAlign:
                        "middle",
                      marginRight:
                        "7px",
                      animation:
                        "loginSpin 1s linear infinite",
                    }}
                  />

                  Signing In...
                </>
              ) : (
                "Sign In"
              )}

            </button>

          </form>

          {/* ==================================================
              DEMO ACCOUNT
              ================================================== */}

          <div className="login-demo">

            <strong>
              Demo Patient Account
            </strong>

            <span>
              Username: patient001
            </span>

            <span>
              Password: Patient@123
            </span>

          </div>

          {/* ==================================================
              FOOTER
              ================================================== */}

          <p className="login-disclaimer">
            Research prototype — not intended
            for clinical diagnosis.
          </p>

        </div>

      </div>

    </div>
  );
}