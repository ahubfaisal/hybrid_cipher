# Hybrid Cipher React App

A modern **Hybrid Cipher / Decipher web application** built using **React (Vite)**.  
This project is a React-based conversion of an existing HTML/CSS/JavaScript cipher system, while keeping the **original UI, CSS, and logic intact**.

## Features

-  Encrypt plain text using a hybrid cipher algorithm
-  Decrypt cipher text back to plain text
-  Toggle between Cipher / Decipher modes
-  Fixed reversible cipher table
-  Original UI & CSS preserved (no redesign)
-  Built with React functional components

## Tech Stack

- **React** (Vite)
- **JavaScript (ES6)**
- **HTML5**
- **CSS3**
- **Git & GitHub**

## Project Structure

```

hybrid-cipher-react/
│
├── public/
│   └── vite.svg
│
├── src/
│   ├── components/
│   │   ├── Cipher.jsx
│   │   ├── Decipher.jsx
│   │   └── FixedTable.jsx
│   │
│   ├── utils/
│   │   └── cipherLogic.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
└── README.md

````

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/ahubfaisal/hybrid_cipher.git
````

### Navigate to Project Folder

```bash
cd hybrid-cipher-react
```

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
npm run dev
```

Open your browser at:

```
http://localhost:5173
```

##  How It Works

* `App.jsx` controls the **Cipher / Decipher mode** using React state
* `Cipher.jsx` handles encryption UI and logic
* `Decipher.jsx` handles decryption UI and logic
* `cipherLogic.js` contains the core hybrid cipher algorithm
* Original CSS is reused to keep the UI exactly the same

## Notes

* This project focuses on **learning React conversion**, not redesign
* No external UI libraries were used
* Ideal for academic projects and demonstrations

##  Author

**Ahub Faisal**
GitHub: (https://github.com/ahubfaisal)


