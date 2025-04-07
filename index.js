import express from 'express';
import authorRoute from './routes/author.js';
import bookRoute from './routes/book.js';
import genreRoute from './routes/genre.js';
import { swaggerDocs, swaggerUi } from './swagger.js';
import uploadroute from './upload.js';

const app = express();

app.use(express.json());

app.use('/authors', authorRoute);
app.use('/books', bookRoute);
app.use('/genres', genreRoute);
app.use('/upload', uploadroute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(3000, () => console.log('server started on port 3000'));
