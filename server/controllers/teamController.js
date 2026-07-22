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

// create team member
const addTeamMember = async (req, res) => {
try {
  const { teamId } = req.params;
  const { userId } = req.body;

  if (!userId) {
return res.status(400).json({
message: "User ID is required",
});
}

await db.query(
`
INSERT INTO team_members (team_id, user_id)
VALUES ($1, $2)
`,
[teamId, userId]
);

return res.status(200).json({
message: "Team member added successfully",
});


} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};

// add team member

const getMyTeams = async (req, res) => {
try {
  const userId = req.user.id;

  const teams = await db.query(
    `
    SELECT
      teams.id,
      teams.name,
      team_members.role,
      teams.created_at
    FROM teams
    JOIN team_members
      ON teams.id = team_members.team_id
    WHERE team_members.user_id = $1
    ORDER BY teams.created_at DESC
    `,
    [userId]
);

return res.status(200).json({
    teams: teams.rows,
})

} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};

// Get Team Members
const getTeamMembers = async (req, res) => {
try {
    const { teamId } = req.params;

    const members = await db.query(
`
SELECT
users.id,
users.name,
users.email,
team_members.role
FROM team_members
JOIN users
ON team_members.user_id = users.id
WHERE team_members.team_id = $1
ORDER BY users.name ASC
`,
[teamId]
);


return res.status(200).json({
members: members.rows,
});


} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};

// Remove Team Member

const removeTeamMember = async (req, res) => {
try {
    const { teamId, userId } = req.params;

await db.query(
`
DELETE FROM team_members
WHERE team_id = $1
AND user_id = $2
`,
[teamId, userId]
);


return res.status(200).json({
message: "Team member removed successfully",
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
addTeamMember,
getMyTeams,
getTeamMembers,
removeTeamMember,
};