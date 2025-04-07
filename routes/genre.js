import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
const route = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /genres:
 *   post:
 *     summary: Create a new genre
 *     tags: [Genre]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the genre
 *                 example: "Fiction"
 *     responses:
 *       200:
 *         description: Genre created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The genre ID
 *                 name:
 *                   type: string
 *                   description: Name of the genre
 *       500:
 *         description: Server error
 */
route.post('/', async (req, res) => {
  try {
    let { name } = req.body;
    let one = await prisma.genre.create({ data: { name: name } });
    res.send(one);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Get all genres with filtering, sorting, and pagination
 *     tags:
 *       - Genre
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
 *         description: Number of genres per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name]
 *         description: Sort genres by name ascending or descending
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search genres by name (case-insensitive)
 *     responses:
 *       200:
 *         description: A list of genres
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
    let all = await prisma.genre.findMany({
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
 * /genres/{id}:
 *   patch:
 *     summary: Update a genre by ID
 *     tags: [Genre]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the genre
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
 *                 description: New name for the genre
 *                 example: "Adventure"
 *     responses:
 *       200:
 *         description: Genre updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       404:
 *         description: Genre not found
 *       500:
 *         description: Server error
 */
route.patch('/:id', async (req, res) => {
  try {
    let { name } = req.body;
    let all = await prisma.genre.update({
      where: { id: +req.params.id },
      data: {
        name,
      },
    });
    res.send(all);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /genres/{id}:
 *   delete:
 *     summary: Delete a genre by ID
 *     tags: [Genre]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the genre
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Genre deleted successfully
 *       404:
 *         description: Genre not found
 *       500:
 *         description: Server error
 */
route.delete('/:id', async (req, res) => {
  try {
    let deleted = await prisma.genre.delete({
      where: { id: +req.params.id },
    });
    res.send(deleted);
  } catch (error) {
    console.log(error);
  }
});

export default route;
