import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const categories = ['popular', 'openings', 'endgame', 'strategy', 'tactics', 'beginners'];

// Default cover images for each category
const defaultCovers = {
  popular: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400&h=300&fit=crop',
  openings: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=300&fit=crop',
  endgame: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=400&h=300&fit=crop',
  strategy: 'https://images.unsplash.com/photo-1538221566857-f6fffde93f56?w=400&h=300&fit=crop',
  tactics: 'https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?w=400&h=300&fit=crop',
  beginners: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=400&h=300&fit=crop'
};

const authorNames = [
  'GM Magnus Carlsen',
  'IM Levy Rozman',
  'GM Hikaru Nakamura',
  'WGM Anna Rudolf',
  'GM Daniel Naroditsky',
  'NM Robert Ramirez',
  'FM Mike Klein'
];

async function updateCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);

    for (const course of courses) {
      // Randomly assign category
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Randomly assign author
      const randomAuthor = authorNames[Math.floor(Math.random() * authorNames.length)];
      
      // Update course
      await Course.findByIdAndUpdate(course._id, {
        category: randomCategory,
        coverImage: defaultCovers[randomCategory],
        authorName: randomAuthor,
        level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)]
      });
      
      console.log(`Updated: ${course.title} -> ${randomCategory} by ${randomAuthor}`);
    }

    console.log('All courses updated!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateCourses();
