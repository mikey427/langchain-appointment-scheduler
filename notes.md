# Notes

## Tools Needed:

- get-current-datetime
- get-availability
- book-appointment
- send-confirmation
- get-caller-info


## OAuth Flow
1. Load/check for existing tokens (if exist, skip OAuth)
2. Generate OAuth URL (with client_id, redirect_uri, etc.)
3. Start temporary express server
4. Display URL to user (print to terminal / auto-open browser)
5. Callback receives code
6. Exchange code for tokens (POST request to Calendly)
7. Store tokens (with expiration time)
8. Shut down temporary server
9. Refresh token (separate function, called when needed)
10. Verify/fetch token (check expiration before using)
