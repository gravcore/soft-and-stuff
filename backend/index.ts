import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

let users = [
    { id: 1, name: "Peter" },
    { id: 2, name: "John" }
];

app.get("/users", (req: Request, res: Response) => {
    res.status(200).json(users);
})

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: 'API server is running',
        version: '1.0.0'
    });
})

app.listen(PORT, () => {
    console.log("========================");
    console.log(`Server is running on http://localhost:${PORT}`)
    console.log("========================");
});
