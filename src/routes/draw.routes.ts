
import { Router } from 'express';
import { prisma } from '../prisma';
import { createDraw } from '../services/draw.service';

const router = Router();

router.post('/', async (_req, res) => {
  try {
    const { draw, assignments } = await createDraw();
    res.status(201).json({ draw, assignments });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const data = await prisma.assignment.findMany({
    where: { drawId: id },
    include: { giver: true, recipient: true },
    orderBy: { id: 'asc' },
  });
  if (data.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

router.delete('/', async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.assignment.deleteMany(),
      prisma.draw.deleteMany()
    ]);

    res.status(200).json({ message: 'Tables assignment et draw vidées avec succès.' });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
