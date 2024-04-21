const sequelize = require('./db'); // Import your database connection
const Item = require('./models/Item'); // Import the model

async function removeItems() {
    await sequelize.sync(); // Make sure your database is synced before removing data
    console.log("Database synced!");

    async function removeItem(itemNumber) {
        try {
            const deletedCount = await Item.destroy({
                where: { itemNumber: itemNumber }
            });
            if (deletedCount > 0) {
                console.log(`Item ${itemNumber} deleted!`);
            } else {
                console.log(`Item ${itemNumber} not found, not deleted!`);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    }

    const itemNumbersToDelete = [
        'generated_or_provided_itemNumber',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '19',
        '18'
    ];

    for (const itemNumber of itemNumbersToDelete) {
        await removeItem(itemNumber);
    }
}

removeItems().catch(error => {
    console.error("Error in removeItems:", error);
});

////////



