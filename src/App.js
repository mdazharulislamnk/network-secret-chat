import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import './App.css'; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const chatBoxRef = useRef(null);

  // Safely read from .env variables (if they aren't found, falls back to original strings)
  const SHARED_TOKEN = process.env.REACT_APP_TOKEN || "network-secret-2025";
  const SECRET_USERNAME = process.env.REACT_APP_USERNAME || "NETWORK";
  const SECRET_PASSWORD = process.env.REACT_APP_PASSWORD || "admin";

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        data.docId = docSnap.id;
        msgs.push(data);
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Error loading messages:", error);
      alert("Failed to load messages. Check console for details.");
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const login = () => {
    if (username !== SECRET_USERNAME || password !== SECRET_PASSWORD || !displayName.trim()) {
      setErrorMsg("Invalid username, password, or display name");
      return;
    }

    setCurrentUser({
      id: Math.random().toString(36).substr(2, 9),
      name: displayName.trim(),
    });
    setErrorMsg('');
  };

  const logout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setDisplayName('');
    setMessages([]);
  };

  const sendMessage = () => {
    const content = newMessage.trim();

    if (!content && !imageFile) {
      alert("Please enter a message or select an image.");
      return;
    }

    if (imageFile) {
      if (imageFile.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const messageObj = {
          sender: currentUser,
          content: content || "",
          image: e.target.result,
          timestamp: serverTimestamp(),
          token: SHARED_TOKEN,
        };
        addDoc(collection(db, "messages"), messageObj).catch((error) => {
          console.error("Error sending message:", error);
          alert("Failed to send message: " + error.message);
        });
        setNewMessage("");
        setImageFile(null);
        document.getElementById("imageInput").value = "";
      };
      reader.onerror = () => alert("Error reading image file.");
      reader.readAsDataURL(imageFile);
    } else {
      const messageObj = {
        sender: currentUser,
        content: content,
        image: null,
        timestamp: serverTimestamp(),
        token: SHARED_TOKEN,
      };
      addDoc(collection(db, "messages"), messageObj).catch((error) => {
        console.error("Error sending message:", error);
        alert("Failed to send message: " + error.message);
      });
      setNewMessage("");
    }
  };

  const deleteMessage = (docId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteDoc(doc(db, "messages", docId)).catch((error) => {
        console.error("Error deleting message:", error);
        alert("Failed to delete message: " + error.message);
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="container">
        <header>
          <h1>NETWORK</h1>
          <p>Secret Global Chat</p>
        </header>

        <div className="login">
          <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '13px', color: '#555' }}>
            Contact <a href="mailto:mdazharulislam@gmail.com" style={{color: '#00a884', textDecoration: 'none', fontWeight: 'bold'}}>mdazharulislam@gmail.com</a> to get username and pass.
          </p>
          {errorMsg && <div className="error" style={{ display: 'block' }}>{errorMsg}</div>}
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />
          <input 
            type="text" 
            placeholder="Display Name" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />
          <button onClick={login}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>NETWORK</h1>
        <p>Secret Global Chat</p>
      </header>

      <div className="chat-container">
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg) => (
            <div 
              key={msg.docId} 
              className={`message ${msg.sender.id === currentUser.id ? "sent" : "received"}`}
            >
              <div className="sender">{msg.sender.name}</div>
              <div>{msg.content || ""}</div>
              {msg.image && <img src={msg.image} alt="Chat" />}
              {msg.sender.id === currentUser.id && (
                <button className="delete-btn" onClick={() => deleteMessage(msg.docId)}>Delete</button>
              )}
            </div>
          ))}
        </div>
        
        <div className="chat-input">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <label htmlFor="imageInput" className="file-label">📎</label>
            <input 
              type="file" 
              id="imageInput" 
              accept="image/*" 
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <div className="buttons">
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
