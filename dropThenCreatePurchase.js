const sequelize = require('./db'); // Import your database connection
const Purchase = require('./models/Purchase'); // Import the Author model

async function resetPurchaseTable() {
    await sequelize.sync(); // Make sure your database is synced before resetting the table
    console.log("Database synced!");

    async function dropAndRecreateresetPurchaseTable() {
        try {
            // Drop the Authors table if it exists
            await Purchase.drop();

            // Create the Authors table
            await Purchase.sync({ force: true });

            console.log('Purchase table dropped and recreated successfully.');
        } catch (error) {
            console.error('Error dropping and recreating Purchase table:', error);
        }
    }

    // Execute the function to drop and recreate the Authors table
    await dropAndRecreateresetPurchaseTable();
}

resetPurchaseTable().catch(error => {
    console.error("Error in resetPurchaseTable:", error);
});

module.exports = resetPurchaseTable;