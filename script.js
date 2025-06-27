:root {
  --bg-dark: #121212;
  --text-dark: #fff;
  --card-dark: #1f1f1f;
  --input-dark: #2c2c2c;
  --green: #28a745;
  --blue: #007bff;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', sans-serif;
  background: var(--bg-dark);
  color: var(--text-dark);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: var(--card-dark);
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.logo {
  font-size: 22px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.telegram-icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
  background: #fff;
  color: #1DA1F2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: 0 0 5px #00000030;
  transition: 0.3s;
}
.telegram-icon:hover {
  transform: scale(1.05);
}

main {
  display: flex;
  justify-content: center;
  padding: 20px 10px;
}

.form-wrapper {
  width: 100%;
  max-width: 600px;
  background: var(--card-dark);
  padding: 20px;
  border-radius: 10px;
}

input, textarea {
  width: 100%;
  padding: 12px 14px;
  margin: 10px 0;
  border-radius: 8px;
  border: none;
  background: var(--input-dark);
  color: var(--text-dark);
  font-size: 16px;
  box-sizing: border-box;
}

textarea {
  min-height: 80px;
}

button {
  padding: 12px 20px;
  margin: 10px 5px 0 0;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
}

#generateBtn {
  background: var(--green);
  color: white;
}

#copyBtn {
  background: var(--blue);
  color: white;
}

.output, .live-preview {
  margin-top: 20px;
  padding: 20px;
  background: #1c1c1c;
  border-radius: 10px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

#thumbs {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

#thumbs img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: 0.3s;
}

/* Responsive */
@media screen and (max-width: 480px) {
  .form-wrapper {
    padding: 15px;
  }

  input, textarea {
    font-size: 15px;
  }

  #thumbs img {
    width: 48px;
    height: 48px;
  }

  .telegram-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .logo {
    font-size: 18px;
  }

  button {
    width: 100%;
    margin-bottom: 10px;
  }

  #copyBtn {
    margin-left: 0;
  }
}
