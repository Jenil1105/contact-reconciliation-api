import {Router, Request, Response} from "express";
import {prisma} from "../lib/prisma";

const router = Router();

router.post("/identify", async(req: Request, res: Response)=>{
    try{
        const{email, phoneNumber} = req.body;
        if(!email && !phoneNumber){
            return res.status(400).json({message:"Email or Phonenumber required"});
        }

        const existingContacts = await prisma.contact.findMany({
            where:{
                OR:[
                    {email: email ?? undefined},
                    {phoneNumber: phoneNumber??undefined},
                ],
            },
        });

        if(existingContacts.length===0){
            const newContact = await prisma.contact.create({
                data:{
                    email: email ?? null,
                    phoneNumber: phoneNumber?? null,
                    linkPrecedence: "primary",
                },
            });

            return res.json({
                contact:{
                    primaryContactId: newContact.id,
                    emails: email ? [email]:[],
                    phoneNumbers: phoneNumber?[phoneNumber]:[],
                    secondaryContactIds: [],
                }
            })
        }

        console.log("Existing contacts:", existingContacts);
        return res.json({message: "Working", existingContacts});

    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server Error"});
    }
});

export default router;
