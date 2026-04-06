# GiPos API - Postman Collection

This directory contains the Postman collection for testing the GiPos API.

## Setup

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `GiPos-API.postman_collection.json`
4. Collection will be imported with all requests

### 2. Setup Environment Variables

Create a new environment in Postman with the following variables:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:8080` | API base URL |
| `access_token` | (empty) | JWT access token (auto-set after login) |
| `refresh_token` | (empty) | JWT refresh token (auto-set after login) |
| `user_id` | (empty) | Current user ID (auto-set after login) |
| `tenant_id` | (empty) | Current tenant ID (auto-set after login) |

### 3. Authentication Flow

1. **Login**: Run the `Login` request in the Authentication folder
   - This will automatically set `access_token`, `refresh_token`, `user_id`, and `tenant_id` in your environment
   - Default credentials:
     - Email: `admin@gipos.id`
     - Password: `password123`

2. **Use Token**: All protected endpoints will automatically use the `access_token` from environment

3. **Refresh Token**: If access token expires, use the `Refresh Token` request to get a new one

## Collection Structure

- **Authentication**: Login, register, refresh token, get current user
- **Health Check**: API health status

## Notes

- All requests follow the API response standard format
- Error responses include error codes from `api-error-codes.md`
- Request ID is automatically included in headers
- Timestamps are in WIB timezone (UTC+7)

## Testing

1. Start the API server: `cd apps/api && go run cmd/api/main.go`
2. Import collection to Postman
3. Setup environment variables
4. Run `Login` request first
5. Test other endpoints


