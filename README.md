# Coffee Order Machine #
Welcome to my first web project. This is a simple one-page web app where you can simply make orders and serve them.  
You can either choose you're a client or a servant. When you're a client, you can order coffee and wait until you get served. When you're a servant, you'll be presented with a full table of the orders that different clients have made and are waiting for you to deliver.

## Getting started ##
If you want to test out my app on your machine, you can follow these instructions:
1. Either clone or download the files (look up google how to clone if you don't know how)
2. Unzip it in any folder you like and open your command line in that folder (cmd, terminal or whatever command app you have)
3. For the app to work you have to install MongoDB, Node.js, and npm on your device (after you install MongoDB, make sure that it's running (mongod), otherwise you'll get an error after the line *Listening to port 3000*)
4. After you've done installing them, type in your command line (opened in the folder where the app.js file is) this code:  
`npm run dev` (all the modules are already included)
5. Open a new tab in your browser and go to http://localhost:3000

## How to use and how it works ##
**Client.** When you add an order to your cart you can order all that stuff. When you order, all your *order list* with your *name* and *unique ID* gets added to the MongoDB database. The database's name is *com* and it has 2 collections. The 1st is *orders* where all the orders are stored and the 2nd one is *sessions* where all the servant sessions are stored.  
The *unique ID* mentioned before is used for 2 reasons: to differ people with the same names and to not let anyone else edit someone else's order by typing their name and ordering something else. **Be careful**, if you reload the page or just leave it, your name and orders will still be in the database and it'll be shown to the servants, however, your ID will be lost and you'll never know what it is unless you access the database itself and look it up or delve into the servants' html code after you log in, *so* don't rage quit. If you want to quit and delete your orders at the same time just click *'A client'* again (which will turn into x). It will delete your orders and your name from the database and reload your page, after that you can quit.  
After you order coffee, your browser will check if you were served every 20 seconds and it will tell you when you'll be eventually served. All served coffee will be marked as *DONE*. Also,  
*PENDING* means you've added an order but haven't ordered it yet.  
*ORDERED* means that you've ordered your coffee but you haven't been served yet.  
**Servant.** ***To log in a servant:*** use  
Username: *admin*  
Password: *youllneverguess*  
When you're a servant, you can serve the clients by ticking the checkbox by their order lists. The orders of the clients *won't* be deleted from servants' tables until they are marked as *DONE* on the clients UIs. If someone has left without deleting his orders from the database, then the only way to delete that order is to use this command in your *mongo shell*: (make sure to `use com` before you write this)  
`db.orders.find({}).pretty()` - this is to find the ID of the client that's rage quit  
`db.orders.remove({_id: ObjectId("put the found ID here")})` - should say *nRemoved: 1*  
**Be careful**, *do not* remove IDs of clients who have their COM pages opened, it may cause an error and the server will be shut down until you rerun it again using `npm run dev`. To stop the server just press CTRL+C (COMMAND+C), same with the *mongo shell*.  
*Also*, the ID of a client can be found in the html of the servant's table, inspect the code of the checkbox by the client.  
Your table gets updated every 20 seconds or you can update it manually by pressing the update button ⟳.

## PS ##
This project was created by me, *Nadir Abdullayev*. It can be improved in many ways, for example, by adding a delete button on the servant's table or adding the feature to turn off the auto-update, again, on the servant's table. But, lazy me (*cough*, I'm not really lazy but I just don't wanna waste my time on this project no more) don't wanna do that. I would rather write a really long readme than doing those things.  
That's it, enjoy.
