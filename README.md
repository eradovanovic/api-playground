This is a React project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This project represents client-side API playground.

This project uses ```Material UI``` components for API playground form and ```MSW``` (Mock Service Worker) for mocking server requests and responses.

## Installing packages and running the app

First, install the necessary packages:

```bash
npm install
```

After this, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Testing application

This playground mocks the requests that follow these formats:

```<ANY_BASE_URL>/api/users```,
```<ANY_BASE_URL>/api/error```,
```<ANY_BASE_URL>/api/slow```

These are the examples for different requests:

### Get users

```bash
GET https://api.example.com/api/users
```

### Get user

```bash
GET https://api.example.com/api/users/1
```

### Create user

```bash
POST https://api.example.com/api/users
```

Request body: 

```bash
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### Update user

```bash
PUT https://api.example.com/api/users/1
```

Request body:

```bash
{
  "firstName": "John",
  "lastName": "Smith"
}
```

### Delete user

```bash
DELETE https://api.example.com/api/users/1
```

### Endpoint for testing request timeout and cancellation

```bash
GET https://api.example.com/api/slow
```

### Endpoint for testing error response

```bash
GET https://api.example.com/api/error
```



