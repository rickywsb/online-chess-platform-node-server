import bcrypt from 'bcryptjs';
const { hash, compare } = bcrypt;

const passwordToTest = 'zyq'; // The password you want to test
const storedHash = '$2a$08$ni6cypMWTjf2psrJ143lgOnA6p9tL6cwjyv.XfQBaEjlaXF3MJ3XC'; // The stored hash from the database

// Manually hash the password with the same salt rounds used when creating the original hash
hash(passwordToTest, 8, function(err, hashedPassword) {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  console.log('Manually hashed password:', hashedPassword);

  // Compare the manually hashed password to the stored hash
  compare(passwordToTest, storedHash, function(err, isMatch) {
    if (err) {
      console.error('Error comparing hashes:', err);
      return;
    }

    console.log('Do the hashes match?', isMatch); // This should be true if the password is correct
  });
});
