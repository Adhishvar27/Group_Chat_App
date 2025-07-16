const jwt = require('jsonwebtoken');
const UserTable = require('../models/userTable');
const key = "cP6+yF@7z%wUb4N!kHq2Rs&E^YjX*Z#vJm3!tQ^pFqL9$Gn6Rd0HbXs!oLjA%TrCq"

async function authenticateuser(req, res, next) {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, key);
        const user = await UserTable.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach user to request
        next(); // Proceed to next middleware/route
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
}

module.exports = { authenticateuser }