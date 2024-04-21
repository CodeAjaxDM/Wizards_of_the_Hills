const sequelize = require('./db'); // Import your database connection
const Author = require('./models/author'); // Import the Author model

async function resetAuthorsTable() {
    await sequelize.sync(); // Make sure your database is synced before resetting the table
    console.log("Database synced!");

    async function dropAndRecreateAuthors() {
        try {
            // Drop the Authors table if it exists
            await Author.drop();

            // Create the Authors table
            await Author.sync({ force: true });

            console.log('Authors table dropped and recreated successfully.');
        } catch (error) {
            console.error('Error dropping and recreating Authors table:', error);
        }
    }

    // Execute the function to drop and recreate the Authors table
    await dropAndRecreateAuthors();
}

resetAuthorsTable().catch(error => {
    console.error("Error in resetAuthorsTable:", error);
});

module.exports = resetAuthorsTable;
