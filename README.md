# Tamanegi
A Homework Collaboration System

# Installation
Make sure to have node.js and mongodb installed. Start mongodb at the default port on your local machine.
After that, run: `npm install` followed by `npm start`. This launches the server at localhost, port 3000.
The application uses the mongodb database named tamanegi. To set up a demo user and some example questions,
go to `http://localhost:3000/setup`. You should see a `OK` message if everything has gone well. After this,
you can sign in using the username `test` and the password `pwd`.

There are also two other users created, `filip` and `jun`. These users have answered a couple of questions already.

When you sign in, click `by due date` to see the current tests, and click the test to see the questions. To see
the answers of other users, either enter an answer or give up. If you give up or answer after you have seen the
answers, you may be given a small penalty by your teacher.

