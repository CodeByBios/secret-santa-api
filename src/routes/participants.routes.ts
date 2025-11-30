
import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const router = Router();

const EMOJIS = [
  "🐶", "🐱", "🐻", "🦊", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🦆", "🦅", "🦉", "🐴", "🦄", "🐢", "🐍", "🦎", "🐠", "🐟", "🐬", "🐳", "🐋"
];

async function getRandomEmoji(): Promise<string> {
  const used = await prisma.participant.findMany({ select: { emoji: true } });
  const usedSet = new Set(used.map(u => u.emoji));
  const available = EMOJIS.filter(e => !usedSet.has(e));
  if (available.length === 0) return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

const singleSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  giftIdea: z.string().min(1),
});

const coupleSchema = z.object({
  a: singleSchema,
  b: singleSchema,
});

router.get('/', async (_req, res) => {
  const list = await prisma.participant.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(list);
});

router.post('/single', async (req, res) => {
  const parsed = singleSchema.safeParse(req.body);
  const emoji = await getRandomEmoji();
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const p = await prisma.participant.create({ data: { ...parsed.data, emoji } });
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.post('/couple', async (req, res) => {
  const parsed = coupleSchema.safeParse(req.body);
  const emojiA = await getRandomEmoji();
  const emojiB = await getRandomEmoji();
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const coupleId = randomUUID();
  try {
    const created = await prisma.$transaction([
      prisma.participant.create({ data: { ...parsed.data.a, coupleId, emoji: emojiA } }),
      prisma.participant.create({ data: { ...parsed.data.b, coupleId, emoji: emojiB } }),
    ]);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const existing = await prisma.participant.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const parsed = singleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  try {
    const updated = await prisma.participant.update({ where: { id }, data: parsed.data });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.participant.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
