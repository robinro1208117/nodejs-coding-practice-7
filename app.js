const express = require("express");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const intializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log("Database connected...........");
    app.listen(501, (err) => {
      if (err) console.log(err);
      else console.log("server running at 501");
    });
  } catch (err) {
    console.log(err);
  }
};

app.get("/players/", async (req, res) => {
  try {
    const sql = `SELECT player_id as playerId,player_name as playerName FROM player_details`;
    const val = await db.all(sql);
    console.log(val);
    res.send(val);
  } catch (err) {
    console.log(err);
    res.send(400);
  }
});
app.get("/players/:playerId/", async (req, res) => {
  try {
    const { playerId } = req.params;
    const sql = `SELECT player_id as playerId,player_name as playerName FROM player_details WHERE player_id=${playerId}`;
    const val = await db.get(sql);
    console.log(val);
    res.send(val);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

app.put("/players/:playerId/", async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log(playerId);
    const { playerName } = req.body;
    const sql = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId}`;
    const val = await db.run(sql);
    console.log(val);
    res.send("Player Details Updated");
  } catch (err) {
    console.log(err);
    res.send("Unable to process");
  }
});
app.get("/matches/:matchId/", async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log(matchId);

    const sql = `SELECT match_id AS matchId, match,year FROM match_details WHERE matchId=${matchId}`;
    const val = await db.get(sql);
    res.send(val);
  } catch (err) {
    console.log(err);
  }
});
app.get("/players/:playerId/matches", async (req, res) => {
  try {
    const { playerId } = req.params;
    const sql = `SELECT match.match_id as matchId,match.match as match,match.year as year from player_match_score AS pm INNER JOIN match_details as match ON pm.match_id=match.match_id WHERE pm.player_id=${playerId}`;
    const cal = await db.get(sql);
    res.send(cal);
  } catch (err) {
    console.log(err);
  }
});
app.get("/matches/:matchId/players", async (req, res) => {
  try {
    const { matchId } = req.params;
    const sql = `SELECT player.player_id as playerId,player.player_name AS playerName from player_match_score AS pms INNER JOIN player_details as player ON player.player_id=pms.player_id WHERE pms.match_id=${matchId} `;
    const val = await db.all(sql);
    res.send(val);
  } catch (err) {
    console.log(err);
    res.send("Error ");
  }
});
app.get("/players/:playerId/playerScores", async (req, res) => {
  try {
    const { playerId } = req.params;
    const sql = `SELECT p.player_id AS playerId,p.player_name AS playerName, SUM(m.score) as totalScore,SUM(m.fours) as totalFours, SUM(m.sixes) AS totalSixes FROM player_match_score as m INNER JOIN player_details as p ON p.player_id=m.player_id WHERE p.player_id=${playerId}`;
    const val = await db.get(sql);
    res.send(val);
  } catch (err) {
    console.log(err);
    res.send("Error ");
  }
});

intializeDbServer();

module.exports = app;
