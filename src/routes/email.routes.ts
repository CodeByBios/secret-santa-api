
import { Router } from 'express';
import { prisma } from '../prisma';
import { sendAssignmentEmail } from '../services/email.service';
import { z } from 'zod';

const router = Router();

const sendSchema = z.object({ drawId: z.string().min(1) });

router.post('/send', async (req, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const assignments = await prisma.assignment.findMany({
    where: { drawId: parsed.data.drawId },
    include: { giver: true, recipient: true },
  });
  if (assignments.length === 0) return res.status(404).json({ error: 'Draw not found' });

  const results: { giverEmail: string; ok: boolean; error?: string }[] = [];
  for (const a of assignments) {
    try {
      await sendAssignmentEmail(a.giver.email, a.giver.fullName, a.recipient.fullName, a.recipient.giftIdea);
      results.push({ giverEmail: a.giver.email, ok: true });
    } catch (e) {
      results.push({ giverEmail: a.giver.email, ok: false, error: (e as Error).message });
    }
  }
  res.json({ count: results.length, results });
});

export default router;
