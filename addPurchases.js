const sequelize = require('./db');
const Purchase = require('./models/Purchase'); 
const Item = require('./models/Item'); 
const User = require('./models/User');





async function addPurchases() {
    await sequelize.sync();
    await User.sync();
    await Item.sync();
    await Purchase.sync();
    console.log("Database synced!");

    async function addPurchase(username, itemNumber) {
        try {
            const purchase = await Purchase.findOrCreate({
                where: { 
                    userId: username,
                    itemId: itemNumber 
                }
            });
            if (purchase[1]) {
                console.log(`Item ${itemNumber} purchased for user ${username}!`);
            } else {
                console.log(`Item ${itemNumber} already purchased by user ${username}, not added!`);
            }
        } catch (error) {
            console.error("Error handling purchase:", error);
        }
    }

    const itemsToPurchase = [
        '001',
        '002',
        '003',
        '004',
        '005',
        '006',
        '007',
        '008'
    ];

    const username = 'Jane Doe';

    for (const itemNumber of itemsToPurchase) {
        await addPurchase(username, itemNumber);
    }
}

addPurchases().catch(error => {
    console.error("Error in addPurchases:", error);
});
