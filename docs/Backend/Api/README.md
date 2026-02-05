<!-- @format -->

# Backend API Reference :raised_hand:

1. ## [Content](CONTENT.md) :page_with_curl:

---

### HTTP Status Code

| Code  | Description             |
| :---- | :---------------------- |
| `200` | `OK`                    |
| `404` | `NOT FOUND`             |
| `400` | `BAD REQUEST`           |
| `403` | `ACCESS DENIED`         |
| `422` | `VALIDATION FAILED`     |
| `500` | `INTERNAL SERVER ERROR` |

> ### Suucess Response

```javascript
{
   "success": true,
   "data": {
   }
}
```

> ### Failed Response

```javascript
{
   "success": false,
   "data": {
      "status": integer,
      "message": string
   }
}
```
