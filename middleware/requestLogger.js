const Log = require('../models/Log');

const requestLogger = (req, res, next) => {
    // Only log GET requests
    if (req.method === 'GET') {
        const url = req.originalUrl || req.url;
        
        // Skip logging for static assets and common non-essential requests
        const skipPatterns = [
            /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i, // Static assets
            /^\/\.well-known\//, // Well-known files (Chrome DevTools, etc.)
            /^\/favicon\.ico$/, // Favicon
            /^\/robots\.txt$/, // Robots.txt
            /^\/sitemap\.xml$/, // Sitemap
            /^\/manifest\.json$/, // Web app manifest
            /^\/service-worker\.js$/, // Service worker
            /^\/api\/logs$/, // Logs API endpoint itself
            /^\/logs-view$/, // Logs view page
        ];
        
        // Check if URL should be skipped
        const shouldSkip = skipPatterns.some(pattern => pattern.test(url));
        
        if (!shouldSkip) {
            const startTime = Date.now();
            
            // Get client IP address
            const ip = req.ip || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress ||
                       (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                       req.headers['x-forwarded-for'] ||
                       'unknown';
            
            // Create log entry
            const logEntry = new Log({
                method: req.method,
                url: url,
                ip: ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
            
            // Save log entry to database
            logEntry.save()
                .then(() => {
                    console.log(`Logged GET request: ${req.method} ${url} from ${ip}`);
                })
                .catch(err => {
                    console.error('Error saving log entry:', err);
                });
            
            // Override res.end to capture response time and status code
            const originalEnd = res.end;
            res.end = function(chunk, encoding) {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                // Update log entry with response information
                Log.findByIdAndUpdate(logEntry._id, {
                    statusCode: res.statusCode,
                    responseTime: responseTime
                }).catch(err => {
                    console.error('Error updating log entry:', err);
                });
                
                originalEnd.call(this, chunk, encoding);
            };
        }
    }
    
    next();
};

module.exports = requestLogger;
