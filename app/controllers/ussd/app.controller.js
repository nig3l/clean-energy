/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const { sms, ussd, menu } = require('../../config/africastalking');
const Model = require('../../models/ticket.model');
const WahomeController = require('./wahome.controller');

const dataToSave = {};

module.exports = async function AppController(req, res) {
  try {
    menu.startState({
      run: () => {
        // use menu.con() to send response without terminating session
        menu.con('Welcome! Ready to register for the Cool Devs Clean energy:'
              + '\n1. Get started'
              + '\n2. Wahome controller!');
      },
      // next object links to next state based on user input
      next: {
        1: 'register',
        2: 'wahome-controller',
      },
    });

    menu.state('register', {
      run: () => {
        menu.con('Do you have an account? If not, enter your name to register');
      },
      next: {
        '*[a-zA-Z]+': 'entry-point-to-new-controller',
      },
    });

    menu.state('entry-point-to-new-controller', {
      run() {
        WahomeController(req, res);
      },
    });

    menu.state('end', {
      run: async () => {
        const tickets = menu.val;
        dataToSave.tickets = tickets;
        console.log(dataToSave);

        // Save the data

        const data = new Model({
          name: dataToSave.name,
          tickets: dataToSave.tickets,
        });

        const dataSaved = await data.save();
        console.log(dataSaved);
        const options = {
          to: menu.args.phoneNumber,
          message: `Hi ${dataToSave.name}, we've reserved ${dataToSave.tickets} tickets for you.`,
        };
        await sms.send(options);

        menu.end('Awesome! We have your tickets reserved. Sending a confirmation text shortly.');
      },
    });

    menu.state('quit', {
      run: () => {
        menu.end('Goodbye :)');
      },
    });
    console.log('result');
    menu.run(req.body, (ussdResult) => {
      res.send(ussdResult);
    });
  } catch (error) {
    console.error(error);
  }
};
