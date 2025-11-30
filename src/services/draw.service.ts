
import { Participant, Assignment, Draw } from '@prisma/client';
import { prisma } from '../prisma';

type ParticipantLite = Pick<Participant, 'id' | 'coupleId'>;

function isValidAssignment(giver: ParticipantLite, recipient: ParticipantLite): boolean {
  if (giver.id === recipient.id) return false;
  if (giver.coupleId && recipient.coupleId && giver.coupleId === recipient.coupleId) return false;
  return true;
}

export async function createDraw(): Promise<{ draw: Draw; assignments: Assignment[] }> {
  const participants = await prisma.participant.findMany();
  if (participants.length < 2) {
    throw new Error('Au moins 2 participants');
  }
  if (participants.length === 2 && participants[0].coupleId && participants[0].coupleId === participants[1].coupleId) {
    throw new Error('Tirage impossible: uniquement un couple présent');
  }

  const list: ParticipantLite[] = participants.map(p => ({ id: p.id, coupleId: p.coupleId }));

  const maxTries = 500;
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const recipients = [...list];
    for (let i = recipients.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
    }

    let ok = true;
    for (let i = 0; i < list.length; i++) {
      if (!isValidAssignment(list[i], recipients[i])) { ok = false; break; }
    }
    if (!ok) {
      for (let i = 0; i < list.length && !ok; i++) {
        if (!isValidAssignment(list[i], recipients[i])) {
          for (let j = 0; j < list.length; j++) {
            if (i !== j && isValidAssignment(list[i], recipients[j]) && isValidAssignment(list[j], recipients[i])) {
              [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
              ok = true;
              for (let k = 0; k < list.length; k++) {
                if (!isValidAssignment(list[k], recipients[k])) { ok = false; break; }
              }
              if (ok) break;
            }
          }
        }
      }
    }
    if (ok) {
      const draw = await prisma.draw.create({ data: {} });
      const assignments = await prisma.$transaction(
        list.map((giver, i) =>
          prisma.assignment.create({
            data: { drawId: draw.id, giverId: giver.id, recipientId: recipients[i].id }
          })
        )
      );
      return { draw, assignments };
    }
  }
  throw new Error('Tirage impossible: contraintes trop fortes. Ajoutez plus de participants.');
}
