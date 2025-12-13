const express = require('express');
const fs = require('fs');
const path = require('path');
const startpairing = require('./pair');

const app = express();
const PORT = process.env.PORT || 1812;

// Session limit configuration
const MAX_SESSIONS = 50;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Store for managing active sessions
const activeSessions = new Map();

// Helper function to validate phone number format
function validatePhoneNumber(phoneNumber) {
    // Remove any non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it starts with 0 (not allowed)
    if (cleaned.startsWith('0')) {
        return { valid: false, error: 'Phone numbers starting with 0 are not allowed' };
    }
    
    // Check if it contains only digits (no letters)
    if (!/^\d+$/.test(cleaned)) {
        return { valid: false, error: 'Phone numbers can only contain digits' };
    }
    
    // Check minimum length (should be at least 10 digits)
    if (cleaned.length < 10) {
        return { valid: false, error: 'Phone number must be at least 10 digits' };
    }
    
    // Check maximum length (should not exceed 15 digits for international format)
    if (cleaned.length > 15) {
        return { valid: false, error: 'Phone number cannot exceed 15 digits' };
    }
    
    return { valid: true, number: cleaned };
}

// Helper function to check session limit
function isSessionLimitReached() {
    return activeSessions.size >= MAX_SESSIONS;
}

// Helper function to count session folders
function countSessionFolders() {
    const pairingDir = './kingbadboitimewisher/pairing';
    
    if (!fs.existsSync(pairingDir)) {
        return 0;
    }
    
    try {
        const sessionFolders = fs.readdirSync(pairingDir);
        return sessionFolders.filter(folder => {
            const sessionPath = path.join(pairingDir, folder);
            const stats = fs.statSync(sessionPath);
            return stats.isDirectory() && folder.endsWith('@s.whatsapp.net');
        }).length;
    } catch (error) {
        console.error('Error counting session folders:', error);
        return 0;
    }
}

// Load existing sessions on startup
function loadExistingSessions() {
    const pairingDir = './kingbadboitimewisher/pairing';
    
    if (!fs.existsSync(pairingDir)) {
        fs.mkdirSync(pairingDir, { recursive: true });
        return;
    }
    
    try {
        const sessionFolders = fs.readdirSync(pairingDir);
        let loadedCount = 0;
        
        sessionFolders.forEach(folder => {
            // Stop loading if we've reached the limit
            if (loadedCount >= MAX_SESSIONS) {
                return;
            }
            
            const sessionPath = path.join(pairingDir, folder);
            const stats = fs.statSync(sessionPath);
            
            if (stats.isDirectory() && folder.endsWith('@s.whatsapp.net')) {
                // Extract phone number from session folder name
                const phoneNumber = folder.replace('@s.whatsapp.net', '');
                
                // Validate if it's a valid phone number format
                const validation = validatePhoneNumber(phoneNumber);
                if (validation.valid) {
                    console.log(`Loading existing session: ${phoneNumber}`);
                    activeSessions.set(phoneNumber, {
                        status: 'loaded',
                        sessionPath: sessionPath,
                        loadedAt: new Date(),
                        sessionId: folder
                    });
                    
                    // Start pairing for existing session - pass the full session ID
                    try {
                        startpairing(folder);
                    } catch (error) {
                        console.error(`Error starting session for ${phoneNumber}:`, error);
                    }
                    
                    loadedCount++;
                }
            }
        });
        
        console.log(`Loaded ${activeSessions.size} existing sessions (limit: ${MAX_SESSIONS})`);
        
        // If there are more folders than the limit, log a warning
        const totalFolders = countSessionFolders();
        if (totalFolders > MAX_SESSIONS) {
            console.warn(`Warning: Found ${totalFolders} session folders, but only loaded ${MAX_SESSIONS} due to session limit`);
        }
    } catch (error) {
        console.error('Error loading existing sessions:', error);
    }
}

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to request pairing code
app.post('/request-pairing', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }
        
        // Check session limit before processing
        if (isSessionLimitReached()) {
            return res.status(429).json({
                success: false,
                error: `Session limit reached. Maximum ${MAX_SESSIONS} sessions allowed.click this button again to move to another server`,
                limit: MAX_SESSIONS,
                current: activeSessions.size
            });
        }
        
        // Validate phone number
        const validation = validatePhoneNumber(phoneNumber);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }
        
        const cleanedNumber = validation.number;
        const sessionId = `${cleanedNumber}@s.whatsapp.net`;
                
        // Add to active sessions
        activeSessions.set(cleanedNumber, {
            status: 'requesting',
            createdAt: new Date(),
            sessionId: sessionId
        });
        
        console.log(`Requesting pairing code for: ${cleanedNumber} (${activeSessions.size}/${MAX_SESSIONS})`);
        
        // Start pairing process with the session ID format
        await startpairing(sessionId);
        
        // Wait for pairing code to be generated
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds timeout
        
        while (attempts < maxAttempts) {
            try {
                const pairingFilePath = './kingbadboitimewisher/pairing/pairing.json';
                if (fs.existsSync(pairingFilePath)) {
                    const pairingData = JSON.parse(fs.readFileSync(pairingFilePath, 'utf8'));
                    if (pairingData.code) {
                        // Update session status
                        activeSessions.set(cleanedNumber, {
                            ...activeSessions.get(cleanedNumber),
                            status: 'code_generated',
                            pairingCode: pairingData.code
                        });
                        
                        // Clean up pairing file
                        fs.unlinkSync(pairingFilePath);
                        
                        return res.json({
                            success: true,
                            phoneNumber: cleanedNumber,
                            sessionId: sessionId,
                            pairingCode: pairingData.code,
                            message: 'Pairing code generated successfully',
                            sessionInfo: {
                                current: activeSessions.size,
                                limit: MAX_SESSIONS,
                                remaining: MAX_SESSIONS - activeSessions.size
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error reading pairing file:', error);
            }
            
            // Wait 1 second before next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        // If we reach here, pairing code generation timed out
        activeSessions.delete(cleanedNumber);
        
        return res.status(408).json({
            success: false,
            error: 'Pairing code generation timed out. Please try again.'
        });
        
    } catch (error) {
        console.error('Error in pairing request:', error);
        
        // Clean up session if it exists
        if (req.body.phoneNumber) {
            const validation = validatePhoneNumber(req.body.phoneNumber);
            if (validation.valid) {
                activeSessions.delete(validation.number);
            }
        }
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error occurred while generating pairing code'
        });
    }
});

// API endpoint to get active sessions
app.get('/sessions', (req, res) => {
    const sessions = Array.from(activeSessions.entries()).map(([phoneNumber, info]) => ({
        phoneNumber,
        ...info
    }));
    
    res.json({
        success: true,
        sessions: sessions,
        total: sessions.length,
        limit: MAX_SESSIONS,
        remaining: MAX_SESSIONS - sessions.length
    });
});

// API endpoint to remove a session
app.delete('/session/:phoneNumber', (req, res) => {
    const { phoneNumber } = req.params;
    
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            error: validation.error
        });
    }
    
    const cleanedNumber = validation.number;
    const sessionId = `${cleanedNumber}@s.whatsapp.net`;
    
    if (!activeSessions.has(cleanedNumber)) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }
    
    activeSessions.delete(cleanedNumber);
    
    // Also try to remove the session directory if it exists
    const sessionDir = `./kingbadboitimewisher/pairing/${sessionId}`;
    try {
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
    } catch (error) {
        console.error(`Error removing session directory for ${cleanedNumber}:`, error);
    }
    
    res.json({
        success: true,
        message: `Session for ${cleanedNumber} removed successfully`,
        sessionInfo: {
            current: activeSessions.size,
            limit: MAX_SESSIONS,
            remaining: MAX_SESSIONS - activeSessions.size
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WhatsApp Pairing Server running on port ${PORT}`);
    console.log(`📱 Access the web interface at: http://localhost:${PORT}`);
    console.log(`📊 Session limit: ${MAX_SESSIONS} concurrent sessions`);
    
    // Load existing sessions after server starts
    setTimeout(loadExistingSessions, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server terminated');
    process.exit(0);
});