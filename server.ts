import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import db from "./src/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-fly-key";

app.use(cors({ origin: "*" }));
app.use(express.json());

/* Root route */
app.get("/", (req, res) => {
  res.json({ message: "Catch The Fly API Running 🚀" });
});

/* Helper */
const getToday = () => new Date().toISOString().split("T")[0];

/* Auth Middleware */
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* Register */
app.post("/api/register", async (req, res) => {
  const { username, email, country, phoneNumber, password } = req.body;

  if (!username || !email || !country || !phoneNumber || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const stmt = db.prepare(
      "INSERT INTO users (id, username, email, phone_number, country, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    stmt.run(
      id,
      username,
      email,
      phoneNumber,
      country,
      hash,
      new Date().toISOString()
    );

    res.json({ success: true });
  } catch (err: any) {
    if (err.message.includes("UNIQUE")) {
      return res
        .status(400)
        .json({ error: "Username, email, or phone already exists" });
    }

    res.status(500).json({ error: "Server error" });
  }
});

/* Login */
app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const stmt = db.prepare(
      "SELECT * FROM users WHERE username=? OR email=? OR phone_number=?"
    );

    const user = stmt.get(identifier, identifier, identifier) as any;

    if (!user) {
      return res.status(401).json({ error: "username or password mismatch" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "username or password mismatch" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phone_number,
        country: user.country,
      },
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* Guest login */
app.post("/api/guest", (req, res) => {
  try {
    const id = uuidv4();
    const username = `Guest_${id.slice(0, 6)}`;

    const stmt = db.prepare(
      "INSERT INTO users (id, username, is_guest, created_at) VALUES (?, ?, 1, ?)"
    );

    stmt.run(id, username, new Date().toISOString());

    const token = jwt.sign({ id, username }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { id, username, is_guest: 1 } });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* Submit score */
app.post("/api/submit-score", authenticate, (req: any, res: any) => {
  const { score, play_time, device_type, mode = "beginner" } = req.body;
  const userId = req.user.id;
  const today = getToday();

  try {
    if (score > play_time * 10) {
      return res
        .status(400)
        .json({ error: "Cheating detected: Impossible score" });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(userId) as any;

    if (!user) return res.status(404).json({ error: "User not found" });

    let plays_today = user.plays_today;

    if (user.last_play_date !== today) {
      plays_today = 0;
    }

    if (plays_today >= 5) {
      return res
        .status(403)
        .json({ error: "Daily limit reached. Upgrade to Premium!" });
    }

    const scoreId = uuidv4();

    db.prepare(
      "INSERT INTO scores (id,user_id,score,mode,play_time,device_type,timestamp) VALUES (?,?,?,?,?,?,?)"
    ).run(
      scoreId,
      userId,
      score,
      mode,
      play_time,
      device_type,
      new Date().toISOString()
    );

    const newTotal = user.total_score + score;
    const newHighest = Math.max(user.highest_score, score);

    db.prepare(
      "UPDATE users SET total_score=?, highest_score=?, plays_today=?, last_play_date=? WHERE id=?"
    ).run(newTotal, newHighest, plays_today + 1, today, userId);

    res.json({
      success: true,
      newHighest,
      plays_today: plays_today + 1,
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* Leaderboard */
app.get("/api/leaderboard", (req, res) => {
  try {
    const stmt = db.prepare(
      "SELECT username, highest_score, total_score FROM users ORDER BY highest_score DESC LIMIT 100"
    );

    const leaderboard = stmt.all();

    res.json(leaderboard);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* Profile */
app.get("/api/profile/:id", authenticate, (req: any, res: any) => {
  try {
    const user = db
      .prepare(
        "SELECT username,total_score,highest_score,plays_today,last_play_date,created_at FROM users WHERE id=?"
      )
      .get(req.params.id) as any;

    if (!user) return res.status(404).json({ error: "User not found" });

    const today = getToday();

    if (user.last_play_date !== today) {
      user.plays_today = 0;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* Start server */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();