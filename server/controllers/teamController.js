const db = require("../config/db");

// Create Team
const createTeam = async (req, res) => {
try {
  const { name } = req.body;
  const ownerId = req.user.id;

  if (!name) {
return res.status(400).json({
message: "Team name is required",
});
}

const team = await db.query(
  `
  INSERT INTO teams (name, owner_id)
  VALUES ($1, $2)
  RETURNING *;
  `,
  [name, ownerId]
  );

  await db.query(
    `
    INSERT INTO team_members (team_id, user_id, role)
    VALUES ($1, $2, 'owner');
    `,
    [team.rows[0].id, ownerId]
  );

  return res.status(201).json({
    message: "Team created successfully",
    team: team.rows[0],
  });


} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};

module.exports = {
createTeam,
};