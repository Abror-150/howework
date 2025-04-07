import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
const route = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     description: Creates a new book with related authors and genres.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Clean Code"
 *               img:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               author:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               genre:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input
 */

route.post('/', async (req, res) => {
  try {
    let { name, img, author = [], genre = [] } = req.body;
    const authors = await prisma.author.findMany({
      where: { id: { in: author } },
    });
    const genres = await prisma.genre.findMany({
      where: { id: { in: genre } },
    });

    if (authors.length !== author.length || genres.length !== genre.length) {
      return res.status(400).send({
        message: "Ba'zi author yoki genre ID lar mavjud emas",
      });
    }
    let one = await prisma.book.create({
      data: {
        name: name,
        img: img,
        author: { connect: author.map((id) => ({ id })) },
        genre: {
          connect: genre.map((id) => ({ id })),
        },
      },
      include: { author: true, genre: true },
    });
    res.send(one);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with filtering, sorting and pagination
 *     tags:
 *       - Books
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name]
 *         description: Sort by book name (ascending or descending)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by book name (case-insensitive)
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       img:
 *                         type: string
 *                       author:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             year:
 *                               type: integer
 *                       genre:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *       500:
 *         description: Internal server error
 */

route.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, name } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let filters = {};
    if (name) {
      filters.name = { contains: name, mode: 'insensitive' };
    }
    let all = await prisma.book.findMany({
      where: filters,
      take,
      skip,
      include: { genre: true, author: true },
    });

    if (sort) {
      if (sort == 'name') {
        all.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort == '-name') {
        all.sort((a, b) => b.name.localeCompare(a.name));
      }
    }
    res.send({ data: all });
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by id
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The book ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book details
 */
route.get('/:id', async (req, res) => {
  try {
    let all = await prisma.book.findFirst({
      where: { id: +req.params.id },
      include: { genre: true, author: true },
    });
    res.send(all);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   patch:
 *     summary: Update a book
 *     tags:
 *       - Books
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the book to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Clean Code
 *               img:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               author:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               genre:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Book successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 img:
 *                   type: string
 *                 author:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       year:
 *                         type: integer
 *                 genre:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid author or genre ID
 *       500:
 *         description: Internal server error
 */

route.patch('/:id', async (req, res) => {
  try {
    let { name, img, author = [], genre = [] } = req.body;
    let all = await prisma.book.update({
      where: { id: +req.params.id },
      data: {
        name,
        img,
        author: { set: author.map((id) => ({ id })) },
        genre: {
          set: genre.map((id) => ({ id })),
        },
      },
      include: { author: true, genre: true },
    });
    res.send(all);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The book ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted book
 */
route.delete('/:id', async (req, res) => {
  try {
    let deleted = await prisma.book.delete({
      where: { id: +req.params.id },
    });
    res.send(deleted);
  } catch (error) {
    console.log(error);
  }
});

export default route;
