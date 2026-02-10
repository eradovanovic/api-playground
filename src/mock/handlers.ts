import { delay, http, HttpResponse } from 'msw'

interface User {
    id: number;
    firstName: string;
    lastName: string;
}

const users = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
    },
];

export const handlers = [
    http.get("*/api/users", async () => {
        await delay(600);
        return HttpResponse.json(users, { status: 200 });
    }),

    http.get("*/api/users/:id", async ({ params }) => {
        await delay(600);

        const id = Number(params.id);
        const user = users.find((u) => u.id === id);

        if (!user) {
            return HttpResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return HttpResponse.json(user, { status: 200 });
    }),

    http.post("*/api/users", async ({ request }) => {
        await delay(700);

        const body = await request.json() as User;
        const newUser = {
            id: users.length + 1,
            firstName: body?.firstName,
            lastName: body?.lastName
        };

        users.push(newUser);

        return HttpResponse.json(newUser, { status: 201 });
    }),

    http.put("*/api/users/:id", async ({ request, params }) => {
        await delay(800);

        const id = Number(params.id);
        const body = await request.json() as User;

        const userIndex = users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
            return HttpResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        users[userIndex] = { id, firstName: body.firstName, lastName: body.lastName };

        return HttpResponse.json(users[userIndex], { status: 200 });
    }),

    http.delete("*/api/users/:id", async ({ params }) => {
        await delay(500);

        const id = Number(params.id);
        const userIndex = users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
            return HttpResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        users.splice(userIndex, 1);

        return new HttpResponse(null, { status: 204 });
    }),

    http.get('*/api/error', async () => {
        await delay(2500);
        return new HttpResponse(null, { status: 404 })
    }),

    http.get("*/api/slow", async () => {
        await delay(10000);
        return HttpResponse.json({ message: "Success" }, { status: 200 });
    })
]