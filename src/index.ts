import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', (req,res) => {
  return res.status(200).send('Hello world');
});

app.listen(PORT, () => {
  console.info(`App is listening to ${PORT}`);
});
