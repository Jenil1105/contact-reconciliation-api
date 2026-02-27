import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/identify", async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;
        if (!email && !phoneNumber) {
            return res.status(400).json({ message: "Email or Phonenumber required" });
        }

        const existingContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email: email ?? undefined },
                    { phoneNumber: phoneNumber ?? undefined },
                ],
            },
        });

        if (existingContacts.length === 0) {
            const newContact = await prisma.contact.create({
                data: {
                    email: email ?? null,
                    phoneNumber: phoneNumber ?? null,
                    linkPrecedence: "primary",
                },
            });

            return res.json({
                contact: {
                    primaryContactId: newContact.id,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: [],
                }
            })
        }

        const primaryIds = new Set<number>();

        existingContacts.forEach(contact => {
            if (contact.linkPrecedence === "primary") {
                primaryIds.add(contact.id);
            } else if (contact.linkedId) {
                primaryIds.add(contact.linkedId);
            }
        });

        const involvedPrimaries = await prisma.contact.findMany({
            where: {
                id: { in: Array.from(primaryIds) }
            }
        });

        const oldestPrimary = involvedPrimaries.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )[0];

        const primaryId = oldestPrimary.id;

        const otherPrimaries = involvedPrimaries.filter(p => p.id !== primaryId);

        for (const primary of otherPrimaries) {

            await prisma.contact.updateMany({
                where: {
                    linkedId: primary.id
                },
                data: {
                    linkedId: primaryId
                }
            });

            await prisma.contact.update({
                where: { id: primary.id },
                data: {
                    linkedId: primaryId,
                    linkPrecedence: "secondary"
                }
            });
        }

        const allLinkedContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primaryId },
                    { linkedId: primaryId }
                ]
            },
        });

        const emails = new Set<string>();
        const phoneNumbers = new Set<string>();

        allLinkedContacts.forEach(contact => {
            if (contact.email) emails.add(contact.email);
            if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
        });

        const isNewEmail = email && !emails.has(email);
        const isNewPhone = phoneNumber && !phoneNumbers.has(phoneNumber);

        if (isNewEmail || isNewPhone) {
            await prisma.contact.create({
                data: {
                    email: email ?? null,
                    phoneNumber: phoneNumber ?? null,
                    linkedId: primaryId,
                    linkPrecedence: "secondary",
                },
            });
        }

        const updatedContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primaryId },
                    { linkedId: primaryId }
                ]
            },
        });

        const finalEmails = new Set<string>();
        const finnalPhones = new Set<string>();
        const secondaryIds: number[] = [];

        updatedContacts.forEach(contact => {
            if (contact.email) finalEmails.add(contact.email);
            if (contact.phoneNumber) finnalPhones.add(contact.phoneNumber);
            if (contact.linkPrecedence === "secondary") secondaryIds.push(contact.id);
        });

        return res.json({
            contact: {
                primaryContactId: primaryId,
                emails: Array.from(finalEmails),
                phoneNumbers: Array.from(finnalPhones),
                secondaryContactIds: secondaryIds,
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
});

export default router;
