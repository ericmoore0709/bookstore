const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBook;

beforeAll(async () => {
    await db.query("DELETE FROM books");
    testBook = {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
    };
    await db.query(
        `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            testBook.isbn,
            testBook.amazon_url,
            testBook.author,
            testBook.language,
            testBook.pages,
            testBook.publisher,
            testBook.title,
            testBook.year
        ]
    );
});

afterAll(async () => {
    await db.end();
});

describe("GET /books", () => {
    test("Get a list of books", async () => {
        const res = await request(app).get("/books");
        expect(res.statusCode).toBe(200);
        expect(res.body.books).toHaveLength(1);
        expect(res.body.books[0]).toHaveProperty("isbn");
    });
});

describe("GET /books/:id", () => {
    test("Get a single book by ISBN", async () => {
        const res = await request(app).get(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book.isbn).toBe(testBook.isbn);
    });

    test("Responds with 404 if can't find book", async () => {
        const res = await request(app).get(`/books/999`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /books", () => {
    test("Create a new book", async () => {
        const newBook = {
            isbn: "1234567890",
            amazon_url: "http://a.co/eobPtX3",
            author: "John Doe",
            language: "english",
            pages: 300,
            publisher: "Example Publisher",
            title: "Example Book",
            year: 2020
        };

        const res = await request(app).post("/books").send(newBook);
        expect(res.statusCode).toBe(201);
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book.isbn).toBe(newBook.isbn);
    });

    test("Prevents creating a book with missing data", async () => {
        const res = await request(app).post("/books").send({});
        expect(res.statusCode).toBe(400);
    });
});

describe("PUT /books/:isbn", () => {
    test("Update a book", async () => {
        const updatedBook = {
            amazon_url: "http://a.co/eobPtX4",
            author: "Jane Doe",
            language: "spanish",
            pages: 350,
            publisher: "Updated Publisher",
            title: "Updated Book",
            year: 2021
        };

        const res = await request(app).put(`/books/${testBook.isbn}`).send(updatedBook);
        expect(res.statusCode).toBe(200);
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book.author).toBe(updatedBook.author);
    });

    test("Responds with 404 if can't find book", async () => {
        const res = await request(app).put(`/books/999`).send({
            amazon_url: "http://a.co/eobPtX5",
            author: "Unknown",
            language: "french",
            pages: 100,
            publisher: "Unknown Publisher",
            title: "Unknown Book",
            year: 2022
        });
        expect(res.statusCode).toBe(404);
    });

    test("Prevents updating a book with invalid data", async () => {
        const res = await request(app).put(`/books/${testBook.isbn}`).send({
            // ommitted Amazon URL
            author: "Jane Doe",
            language: "spanish",
            pages: 350,
            publisher: "Updated Publisher",
            title: "Updated Book",
            year: 2021
        });
        expect(res.statusCode).toBe(400);
    });
});

describe("DELETE /books/:isbn", () => {
    test("Delete a book", async () => {
        const res = await request(app).delete(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Book deleted" });
    });

    test("Responds with 404 if can't find book", async () => {
        const res = await request(app).delete(`/books/999`);
        expect(res.statusCode).toBe(404);
    });
});
