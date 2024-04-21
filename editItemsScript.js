//USE THIS FILE/ FORMAT TO CHANGE ATTRIBUTES IN THE ITEMS TABLE!
//RUN: node editItemsScript.js
const sequelize = require('./db'); // Import your database connection
const Item = require('./models/Item'); // Import the model

async function updateItem() {
    try {
        await sequelize.sync(); // Make sure your database is synced before updating data
        console.log("Database synced!");

        const itemNumberToUpdate = '007'; // The unique identifier for the item you want to update
        const updatedValues = {
            //YOUR CHANGES WOULD GO HERE! 
            //price: 10.99, 
            //description: 'Updated description here.', 
            //imageUrl: '/images/item-bundle.png'
            //category: 'character options'
        };

        // Update item
        const [numberOfAffectedRows, affectedRows] = await Item.update(updatedValues, {
            where: { itemNumber: itemNumberToUpdate },
            returning: true // Optional: for PostgreSQL, returns the affected rows
        });

        if (numberOfAffectedRows > 0) {
            console.log("Item updated successfully!");
            console.log(affectedRows); // Log the updated item details
        } else {
            console.log("No item found with the specified itemNumber, or no new data given.");
        }
    } catch (error) {
        console.error("Error updating item:", error);
    }
}

updateItem();
