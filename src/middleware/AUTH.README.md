
## Authentication

All protected endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <encrypted_token>
```

Tokens are obtained from login/register endpoints and expire after 7 days.
