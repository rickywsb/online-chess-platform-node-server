import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import User from '../models/User.js'; // Ensure the path is correct

const mongoURI = 'mongodb+srv://wusiboricky:zyq19960123@cluster0.cgta2mx.mongodb.net/?retryWrites=true&w=majority';

const populateUsers = async () => {
  try {
    await mongoose.connect(mongoURI);

    const users = [];

    for (let i = 0; i < 300; i++) {
      const username = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const role = faker.helpers.arrayElement(['student', 'instructor', 'admin']);
      const bio = faker.lorem.sentences();
      const profilePicture = faker.image.avatar();
      const dateOfBirth = faker.date.past(30, new Date('2000-01-01'));
      const phoneNumber = faker.phone.number();
      
      users.push({
        username,
        email,
        password,
        role,
        bio,
        profilePicture,
        dateOfBirth,
        phoneNumber,
      });
    }

    await User.insertMany(users);

    console.log('Successfully populated 300 users');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error populating users:', error);
    await mongoose.connection.close();
  }
};

populateUsers();
