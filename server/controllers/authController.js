const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await db.query(
`INSERT INTO users(
name,
email,
password,
verification_token,
is_verified
)
VALUES($1,$2,$3,$4,$5)
RETURNING id,name,email`,
[
name,
email,
hashedPassword,
verificationToken,
false
]
);

await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "User Registered Successfully",
      user: newUser.rows[0],
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if fields are empty
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    // Find user
    const user = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!user.rows[0].is_verified) {
return res.status(403).json({
message: "Please verify your email before logging in.",
verified: false,
});
}


    // Compare password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.rows[0].id,
        email: user.rows[0].email,
      },
      "taskflowsecret",
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const verifyEmail = async (req, res) => {
try {
const { token } = req.params;

const user = await db.query(
"SELECT * FROM users WHERE verification_token = $1",
[token]
);

if (user.rows.length === 0) {
return res.status(400).json({
message: "Invalid or expired verification link",
});
}

await db.query(
`UPDATE users
SET is_verified = true,
verification_token = NULL
WHERE verification_token = $1`,
[token]
);

res.redirect("http://localhost:5173/email-verified");

} catch (error) {
console.log(error);
res.status(500).json({
message: "Server Error",
});
}
};

const resendVerification = async (req, res) => {
try {
const { email } = req.body;

const user = await db.query(
"SELECT * FROM users WHERE email = $1",
[email]
);

if (user.rows.length === 0) {
return res.status(404).json({
message: "User not found",
});
}

if (user.rows[0].is_verified) {
return res.status(400).json({
message: "Email is already verified",
});
}

const verificationToken = crypto.randomBytes(32).toString("hex");

await db.query(
`UPDATE users
SET verification_token = $1
WHERE email = $2`,
[verificationToken, email]
);

await sendVerificationEmail(email, verificationToken);

res.json({
message: "Verification email sent successfully",
});

} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};



module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
};