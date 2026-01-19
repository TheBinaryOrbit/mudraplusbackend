import Prisma from "./src/config/prismaClient.js";


async function main(){
    const contact = await Prisma.contactslist.findUnique({
        where  : { id: 2}
    })

    console.log(contact.contactList.filter(item => String(item.displayName).toLowerCase().includes("") ));

    return contact;
}
  
main()