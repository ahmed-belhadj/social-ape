var admin = require("firebase-admin");
var faker = require("faker");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
let db = admin.firestore();

// Seed mock users
for (let i = 0; i < 100; i++) {
  let mockUser = {
    bio: `${faker.name.title()} at ${faker.company.companyName()}. ${faker.company.catchPhrase()}.`,
    createdAt: new Date(faker.date.between(1983, 2020)).toISOString(),
    email: faker.internet.exampleEmail(),
    handle: faker.internet.userName(),
    location: faker.address.city(),
    userId: faker.random.uuid(),
    website: faker.internet.url(),
  };
  console.log("Seeding ", mockUser.handle, "...");
  mockUser.imageUrl = `https://robohash.org/${mockUser.handle}`;
  db.doc(`/users/${mockUser.handle}`)
    .set(mockUser)
    .catch((err) => {
      console.error(err);
    });
  //for each user, give it a random number of screams
  for (let i = 0; i < faker.random.number(10); i++) {
    let mockScream = {
      body: faker.random.arrayElement([
        faker.hacker.phrase(),
        faker.company.bs(),
        faker.commerce.productDescription(),
      ]),
      commentCount: faker.random.number(10),
      createdAt: new Date(
        faker.date.between(mockUser.createdAt, 2020)
      ).toISOString(),
      likeCount: faker.random.number(100),
      userHandle: mockUser.handle,
      userImage: mockUser.imageUrl,
    };
    db.collection("screams")
      .add(mockScream)
      .then((doc) => {
        const resScream = mockScream;
        resScream.screamId = doc.id;
        // seed random comments according to commentCount
        for (let i = 0; i < resScream.commentCount; i++) {
          let mockComment = {
            body: faker.random.arrayElement([
              faker.random.words(),
              faker.git.commitMessage(),
              faker.company.bs(),
              faker.commerce.productAdjective(),
            ]),
            createdAt: new Date(
              faker.date.between(resScream.createdAt, 2020)
            ).toISOString(),
            screamId: resScream.screamId,
            userHandle: faker.internet.userName(),
          };
          mockComment.userImage = `https://robohash.org/${mockComment.userHandle}`;
          db.collection("comments").add(mockComment);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
