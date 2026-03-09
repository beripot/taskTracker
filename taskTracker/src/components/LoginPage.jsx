import { useState } from 'react';

const AGENTS = [
  "Mcquinley Josh Maglangit",
  "Phillip John Mamac",
  "Nahre Fuentes",
  "Ark Von Ryan Guillema",
  "Angel Pink Librada"
];

// Agent credentials
const AGENT_CREDENTIALS = {
  "Mcquinley Josh Maglangit": "cmi2024",
  "Phillip John Mamac": "cmi2024",
  "Nahre Fuentes": "cmi2024",
  "Ark Von Ryan Guillema": "cmi2024",
  "Angel Pink Librada": "cmi2024",
};

export default function LoginPage({ theme, setTheme, onLogin }) {

  const [selectedAgent, setSelectedAgent] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedAgent) {
      setError('Please select your name.');
      return;
    }

    if (!accessCode) {
      setError('Please enter the access code.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {

      const validCode = AGENT_CREDENTIALS[selectedAgent];

      if (accessCode === validCode) {
        onLogin(selectedAgent);
      } else {
        setError('Invalid access code. Please try again.');
        setIsLoading(false);
      }

    }, 600);
  };

  return (

    <div className="login-wrapper" data-theme={theme}>

      <div className="login-theme-controls">
        {['light', 'dark', 'emerald', 'cyber'].map((t) => (
          <button
            key={t}
            className={`theme-btn btn-${t}`}
            onClick={() => setTheme(t)}
            title={t}
          />
        ))}
      </div>

      <div className="login-card">

        <div className="login-card-header">
          <div className="login-logo">CMI</div>
          <h1>Bidding Task Tracker</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="login-form-group">

            <label>Agent Name</label>

            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                setError('');
              }}
            >
              <option value="">Select your name...</option>

              {AGENTS.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>

          </div>

          <div className="login-form-group">

            <label>Access Code</label>

            <div className="password-wrapper">

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter team access code"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError('');
                }}
                autoComplete="off"
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <div className="login-footer">
          CMI Bidding Team • Internal Use Only
        </div>

      </div>

    </div>
  );
}