const bcrypt = require("bcryptjs");

// Simulated stored hashed password from DB
const storedHashedPassword = "$2b$10$hNgLLLJoTCsLfw.ptVPlyeVspCNf/I1GKtvNZYUSCXoV03OUqVuqO";

// Plain password entered by user
const plainPassword = "Akash@2212";

bcrypt.compare(plainPassword, storedHashedPassword, (err, result) => {
    if (err) {
        console.log("Error comparing passwords:", err);
    } else if (result) {
        console.log("✅ Password matches!");
    } else {
        console.log("❌ Password does NOT match!");
    }
});
