
import express from 'express';
import cors from 'cors';
import { env } from './env';
import participantsRouter from './routes/participants.routes';
import drawRouter from './routes/draw.routes';
import emailRouter from './routes/email.routes';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/participants', participantsRouter);
app.use('/draws', drawRouter);
app.use('/emails', emailRouter);

app.listen(env.PORT, () => {
  console.log(`Secret Santa API listening on :${env.PORT}`);
});
