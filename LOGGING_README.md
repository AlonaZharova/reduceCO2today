# Request Logging System

This implementation adds comprehensive logging of all GET requests to the website into a MongoDB database.

## Features

- **Automatic Logging**: All GET requests are automatically logged to the database
- **Detailed Information**: Each log entry includes:
  - HTTP method
  - Request URL
  - Client IP address
  - User agent string
  - Timestamp
  - Response status code
  - Response time (in milliseconds)

## Implementation Details

### 1. Database Model (`models/Log.js`)
- MongoDB schema for storing request logs
- Includes all necessary fields for comprehensive request tracking
- Uses timestamps for automatic creation/update tracking

### 2. Middleware (`middleware/requestLogger.js`)
- Intercepts all incoming requests
- Filters for GET requests only
- Captures request details and response information
- Saves logs to database asynchronously
- Measures response time by overriding `res.end()`

### 3. Integration (`config/index.js`)
- Middleware is integrated into the Express app configuration
- Runs early in the middleware stack to capture all requests

### 4. Log Viewing (`views/logs.hbs`)
- Web interface to view logged requests
- Paginated display of logs
- Statistics dashboard showing:
  - Total requests
  - Average response time
  - Success rate
- Color-coded status codes and HTTP methods

## Usage

### Automatic Logging
Once the server is running, all GET requests will be automatically logged to the database. No additional configuration is needed.

### Viewing Logs
1. **Web Interface**: Visit `/logs-view` to see a paginated view of all logs
2. **API Endpoint**: Use `/logs?page=1&limit=50` to get JSON data of logs
3. **Database**: Directly query the `logs` collection in MongoDB

### API Endpoints

#### GET `/logs-view`
- Renders the logs web interface

#### GET `/logs`
- Returns JSON data of logs
- Query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Number of logs per page (default: 50)

## Database Schema

```javascript
{
  method: String,        // HTTP method (e.g., "GET")
  url: String,          // Request URL
  ip: String,           // Client IP address
  userAgent: String,    // User agent string
  timestamp: Date,      // Request timestamp
  statusCode: Number,   // Response status code
  responseTime: Number, // Response time in milliseconds
  createdAt: Date,      // Document creation time
  updatedAt: Date       // Document last update time
}
```

## Testing

Run the test script to verify the logging functionality:

```bash
node test-logging.js
```

This will:
1. Connect to your MongoDB database
2. Create a test log entry
3. Retrieve and display recent logs
4. Verify the logging system is working correctly

## Configuration

Make sure your `.env` file contains:
```
MONGODB_URI=your_mongodb_connection_string
```

## Performance Considerations

- Logging is asynchronous and won't block request processing
- Database operations are non-blocking
- Response time measurement adds minimal overhead
- Consider implementing log rotation/cleanup for production use

## Security Notes

- IP addresses and user agents are logged for debugging purposes
- Consider implementing log retention policies
- Ensure database access is properly secured
- The logs view should be protected in production environments


