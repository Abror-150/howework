import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

const route = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Created author
 */
route.post('/', async (req, res) => {
  try {
    let { name, year } = req.body;
    let one = await prisma.author.create({ data: { name: name, year: year } });
    res.send(one);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors with filtering, sorting, and pagination
 *     tags:
 *       - Authors
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
 *         description: Number of authors per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name]
 *         description: Sort authors by name ascending or descending
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search authors by name (case-insensitive)
 *     responses:
 *       200:
 *         description: A list of authors
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
 *                       year:
 *                         type: integer
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
    let all = await prisma.author.findMany({
      where: filters,
      take,
      skip,
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
 * /authors/{id}:
 *   patch:
 *     summary: Update an author
 *     tags: [Authors]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The author ID
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
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated author
 */
route.patch('/:id', async (req, res) => {
  try {
    let { name, year } = req.body;
    let all = await prisma.author.update({
      where: { id: +req.params.id },
      data: {
        name,
        year,
      },
    });
    res.send(all);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     tags: [Authors]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The author ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted author
 */
route.delete('/:id', async (req, res) => {
  try {
    let deleted = await prisma.author.delete({
      where: { id: +req.params.id },
    });
    res.send(deleted);
  } catch (error) {
    console.log(error);
  }
});

export default route;
